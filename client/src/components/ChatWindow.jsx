import React, { useEffect, useState, useRef } from "react";
import { useParams }                          from "react-router-dom";
import { getConversation, getProfile }        from "../services/api";
import socket                                 from "../socket";
import { useAuth }                            from "../context/AuthContext";
import sodium                                 from "libsodium-wrappers";
import {
  publicKey  as myPublicKey,
  privateKey as myPrivateKey
} from "../crypto/keys";
import "./styles/ChatWindow.css";

export default function ChatWindow() {
  const { convoId } = useParams();
  const { user }    = useAuth();

  const [convoMeta, setConvoMeta]       = useState(null);
  const [messages, setMessages]         = useState([]);
  const [text, setText]                 = useState("");
  const [sharedSecret, setSharedSecret] = useState(null);
  const bottomRef                       = useRef();

  // 1️⃣ Initialize: fetch convo, derive secret if 1:1, decrypt, join room
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: convo } = await getConversation(convoId);
        if (!mounted) return;
        setConvoMeta(convo);

        // Group chat? Just show plaintext
        if (convo.name) {
          setMessages(convo.messages);
          socket.emit("joinConvo", convoId);
          return;
        }

        // 1:1 chat: find the other user
        const other = convo.participants.find((p) => p.username !== user.username);
        if (!other) {
          setMessages(convo.messages);
          socket.emit("joinConvo", convoId);
          return;
        }

        // Fetch their public key
        const { data: profile } = await getProfile(other.username);
        if (!mounted) return;
        if (!profile.publicKey) {
          console.warn("Other user has no publicKey—sending plaintext");
          setMessages(convo.messages);
          socket.emit("joinConvo", convoId);
          return;
        }

        // ECDH key-exchange
        await sodium.ready;
        const theirPub = sodium.from_base64(profile.publicKey);
        const myPriv   = sodium.from_base64(myPrivateKey);
        const secret   = sodium.crypto_scalarmult(myPriv, theirPub);
        setSharedSecret(secret);

        // Decrypt prior messages
        const decrypted = convo.messages.map((m) => {
          if (m.cipher && m.nonce) {
            try {
              const pt = sodium.crypto_secretbox_open_easy(
                sodium.from_base64(m.cipher),
                sodium.from_base64(m.nonce),
                secret
              );
              return { ...m, content: sodium.to_string(pt) };
            } catch {
              return { ...m, content: "[cannot decrypt]" };
            }
          }
          return m; // plaintext fallback
        });
        setMessages(decrypted);

        socket.emit("joinConvo", convoId);
      } catch (e) {
        console.error("Chat init error:", e);
      }
    }

    init();
    return () => { mounted = false; };
  }, [convoId, user.username]);

  // 2️⃣ Listen to incoming messages
  useEffect(() => {
    const onNew = ({ convoId: id, cipher, nonce, sender, createdAt, content }) => {
      if (id !== convoId) return;

      let txt;
      if (sharedSecret && cipher && nonce) {
        try {
          const pt = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(cipher),
            sodium.from_base64(nonce),
            sharedSecret
          );
          txt = sodium.to_string(pt);
        } catch {
          txt = "[decrypt failed]";
        }
      } else {
        txt = content;
      }

      setMessages((msgs) => [
        ...msgs,
        { _id: Date.now().toString(), sender, content: txt, createdAt },
      ]);
    };

    socket.on("newMessage", onNew);
    return () => socket.off("newMessage", onNew);
  }, [convoId, sharedSecret]);

  // 3️⃣ Auto‐scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4️⃣ Send
  const send = async () => {
    const m = text.trim();
    if (!m) return;

    // warn if 1:1 without E2EE
    if (!convoMeta?.name && !sharedSecret) {
      if (!window.confirm("⚠️ Sending unencrypted plaintext. Continue?")) {
        return;
      }
    }

    if (convoMeta?.name) {
      // group: plaintext
      socket.emit("sendMessage", { convoId, content: m });
    } else if (sharedSecret) {
      // 1:1 encrypted
      await sodium.ready;
      const nonce  = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const cipher = sodium.crypto_secretbox_easy(
        sodium.from_string(m),
        nonce,
        sharedSecret
      );
      socket.emit("sendMessage", {
        convoId,
        cipher: sodium.to_base64(cipher),
        nonce:  sodium.to_base64(nonce),
      });
    } else {
      // plaintext fallback
      socket.emit("sendMessage", { convoId, content: m });
    }

    setText("");
  };

  // Chat header: group name or other user
  const header = () => {
    if (!convoMeta) return "";
    if (convoMeta.name) return convoMeta.name;
    const other = convoMeta.participants.find((p) => p.username !== user.username);
    return other?.username || user.username;
  };

  return (
    <div className="chat-window">
      <header className="chat-header">{header()}</header>

      <div className="messages">
        {messages.map((m) => {
          const mine = String(m.sender._id) === user.id;
          return (
            <div key={m._id} className={`msg ${mine ? "mine" : ""}`}>
              <span className="msg-user">{m.sender.username}</span>
              <p className="msg-text">{m.content}</p>
              <span className="msg-time">
                {new Date(m.createdAt).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
