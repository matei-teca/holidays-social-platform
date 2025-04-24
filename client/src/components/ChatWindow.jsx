// client/src/components/ChatWindow.jsx

import React, { useEffect, useState, useRef } from "react";
import { useParams }                          from "react-router-dom";
import {
  getConversation,
  getProfile
} from "../services/api";
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
  const { user }    = useAuth(); // { id, username, token }

  const [messages, setMessages]         = useState([]);
  const [text, setText]                 = useState("");
  const [sharedSecret, setSharedSecret] = useState(null);
  const bottomRef                       = useRef();

  // 1️⃣ Initialize: fetch history, derive secret, decrypt, join room
  useEffect(() => {
    let isMounted = true;

    async function initChat() {
      try {
        const { data: convo } = await getConversation(convoId);
        if (!isMounted) return;

        // find the "other" user
        const other = convo.participants.find(p => p.username !== user.username);
        if (!other) {
          setMessages(convo.messages);
          socket.emit("joinConvo", convoId);
          return;
        }

        // fetch their publicKey
        const { data: profile } = await getProfile(other.username);
        if (!isMounted) return;

        if (!profile.publicKey) {
          console.warn("Other user has no publicKey, skipping E2EE");
          setMessages(convo.messages);
          socket.emit("joinConvo", convoId);
          return;
        }

        // derive shared secret
        await sodium.ready;
        const theirPub = sodium.from_base64(profile.publicKey);
        const myPriv   = sodium.from_base64(myPrivateKey);
        const secret   = sodium.crypto_scalarmult(myPriv, theirPub);

        // decrypt stored messages
        const decrypted = convo.messages.map(m => {
          if (m.cipher && m.nonce) {
            try {
              const pt = sodium.crypto_secretbox_open_easy(
                sodium.from_base64(m.cipher),
                sodium.from_base64(m.nonce),
                secret
              );
              return { ...m, content: sodium.to_string(pt) };
            } catch {
              return { ...m, content: "[Unable to decrypt]" };
            }
          }
          return m;
        });

        if (isMounted) {
          setSharedSecret(secret);
          setMessages(decrypted);
        }

        socket.emit("joinConvo", convoId);
      } catch (err) {
        console.error("Chat init failed:", err);
      }
    }

    initChat();
    return () => { isMounted = false; };
  }, [convoId, user.username]);

  // 2️⃣ Listen for new encrypted messages, decrypt them
  useEffect(() => {
    const handler = ({ convoId: id, cipher, nonce, sender, createdAt, content }) => {
      if (id !== convoId) return;
      let text;
      if (cipher && nonce && sharedSecret) {
        const pt = sodium.crypto_secretbox_open_easy(
          sodium.from_base64(cipher),
          sodium.from_base64(nonce),
          sharedSecret
        );
        text = sodium.to_string(pt);
      } else {
        // fallback plaintext
        text = content;
      }
      setMessages(msgs => [
        ...msgs,
        { _id: `${Date.now()}`, sender, content: text, createdAt }
      ]);
    };

    socket.on("newMessage", handler);
    return () => { socket.off("newMessage", handler); };
  }, [convoId, sharedSecret]);

  // 3️⃣ Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4️⃣ Encrypt & send (or fallback to plaintext)
  const send = async () => {
    const msg = text.trim();
    if (!msg) return;

    if (!sharedSecret) {
        const ok = window.confirm(
          "⚠️ The other user does not have a public key set, so this chat is unencrypted. \n \n Any messages you send will be in plaintext. Continue?"
        );
        if (!ok) return;
    }

    if (sharedSecret) {
      const nonce  = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const cipher = sodium.crypto_secretbox_easy(
        sodium.from_string(msg),
        nonce,
        sharedSecret
      );
      socket.emit("sendMessage", {
        convoId,
        cipher: sodium.to_base64(cipher),
        nonce:  sodium.to_base64(nonce)
      });
    } else {
      socket.emit("sendMessage", { convoId, content: msg });
    }

    setText("");
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map(m => {
          const mine = String(m.sender._id) === String(user.id);
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
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
