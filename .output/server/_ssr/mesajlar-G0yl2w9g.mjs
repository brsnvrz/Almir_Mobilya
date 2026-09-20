import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DxLTTzyN.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as formatPrice } from "./format-zQdBECWS.mjs";
import { c as Send, f as Package, p as MessageSquare, s as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useAuth, n as AuthModal } from "./AuthModal-C56nx3nQ.mjs";
import { t as Route } from "./mesajlar-CczOc8oQ.mjs";
import { t as notifyAdminsOnNewQuestion } from "./notifications-D42LmJ8Y.mjs";
import { i as insertMessageReply, n as getMessages, r as insertMessage, t as getMessageReplies } from "./messages-tFNJ6S8J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mesajlar-G0yl2w9g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MessagesPage() {
	const { urun } = Route.useSearch();
	const { user, isAdmin } = useAuth();
	const queryClient = useQueryClient();
	const [authModalOpen, setAuthModalOpen] = (0, import_react.useState)(false);
	const [body, setBody] = (0, import_react.useState)("");
	const [subject, setSubject] = (0, import_react.useState)("");
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [reply, setReply] = (0, import_react.useState)("");
	const { data: relatedProduct } = useQuery({
		queryKey: ["related-product", urun],
		enabled: !!urun,
		queryFn: async () => {
			const { data, error } = await supabase.from("products").select("id, name, image_url, price, currency").eq("id", urun).maybeSingle();
			if (error) return null;
			return data;
		}
	});
	(0, import_react.useEffect)(() => {
		if (relatedProduct && !subject) setSubject(`${relatedProduct.name} hakkında soru`);
	}, [relatedProduct]);
	const { data: threads, isLoading: threadsLoading } = useQuery({
		queryKey: [
			"my-messages",
			user?.id,
			isAdmin
		],
		enabled: !!user,
		queryFn: async () => {
			return getMessages({
				userId: user?.id,
				userEmail: user?.email ?? void 0,
				isAdmin
			});
		}
	});
	const selectedId = activeId ?? threads?.[0]?.id ?? null;
	const selectedThread = threads?.find((t) => t.id === selectedId) ?? null;
	(0, import_react.useEffect)(() => {
		const handler = () => {
			queryClient.invalidateQueries({ queryKey: ["my-messages"] });
			if (selectedId) queryClient.invalidateQueries({ queryKey: ["replies", selectedId] });
		};
		window.addEventListener("almir-messages-changed", handler);
		return () => window.removeEventListener("almir-messages-changed", handler);
	}, [selectedId, queryClient]);
	const { data: replies } = useQuery({
		queryKey: ["replies", selectedId],
		enabled: !!selectedId,
		queryFn: async () => {
			return getMessageReplies(selectedId);
		}
	});
	const createMessage = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Giriş yapmanız gerekmektedir.");
			if (!body.trim()) throw new Error("Lütfen bir soru mesajı yazın.");
			const subjectText = subject.trim() || (relatedProduct ? `${relatedProduct.name} hakkında soru` : "Genel Soru");
			const inserted = await insertMessage({
				user_id: user.id,
				user_email: user.email ?? null,
				user_name: user.user_metadata?.["full_name"] ?? null,
				subject: subjectText,
				body: body.trim(),
				product_id: urun ?? null,
				product: relatedProduct ? {
					id: relatedProduct.id,
					name: relatedProduct.name,
					image_url: relatedProduct.image_url ?? null,
					price: relatedProduct.price ?? null,
					currency: relatedProduct.currency ?? "TRY"
				} : null
			});
			notifyAdminsOnNewQuestion({
				messageId: inserted.id,
				subject: subjectText,
				body: body.trim(),
				userEmail: user.email ?? null,
				userName: user.user_metadata?.["full_name"] ?? null,
				productId: urun ?? null,
				productName: relatedProduct?.name ?? null
			});
			return inserted;
		},
		onSuccess: (newMsg) => {
			setBody("");
			setSubject("");
			setActiveId(newMsg.id);
			toast.success("Sorunuz Almir Mobilya ekibine iletildi!");
			queryClient.invalidateQueries({ queryKey: ["my-messages"] });
		},
		onError: (err) => {
			toast.error("Mesaj gönderilemedi: " + (err.message || "Tekrar deneyin."));
		}
	});
	const sendReply = useMutation({
		mutationFn: async () => {
			if (!user || !selectedId) throw new Error("Giriş gerekli");
			if (!reply.trim()) return;
			await insertMessageReply({
				message_id: selectedId,
				author_id: user.id,
				author_name: user.user_metadata?.["full_name"] ?? user.email ?? null,
				from_admin: isAdmin,
				body: reply.trim()
			});
		},
		onSuccess: () => {
			setReply("");
			queryClient.invalidateQueries({ queryKey: ["replies", selectedId] });
			toast.success("Yanıtınız eklendi.");
		}
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-5 py-24 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-7" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-5 font-display text-4xl font-semibold tracking-tight",
				children: "Soru Sormak İçin Giriş Yapın"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-base text-muted-foreground",
				children: "Almir Mobilya yetkililerine ölçü, fiyat veya özel tasarım sorularınızı iletebilmek ve verilen yanıtları canlı takip edebilmek için Google hesabınızla giriş yapın."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setAuthModalOpen(true),
				className: "mt-8 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105",
				children: "Giriş Yap"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthModal, {
				isOpen: authModalOpen,
				onClose: () => setAuthModalOpen(false)
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "label-eyebrow",
				children: "Müşteri İletişim"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Sorularınız ve Yanıtlar"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-base text-muted-foreground",
				children: "Sorularınızı doğrudan atölye ekibimize iletin. Yanıtlar aynı gün içinde bu ekranda görüntülenir."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel mt-8 p-6 shadow-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold",
							children: "Yeni Soru Gönder"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: user.email
						})]
					}),
					relatedProduct && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: relatedProduct.image_url || "/images/kategori-dolap.jpg",
								alt: relatedProduct.name,
								className: "size-12 rounded-lg object-cover border border-border"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-primary",
								children: "İlgili Ürün"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: relatedProduct.name
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-sm font-bold text-primary",
							children: formatPrice(relatedProduct.price ? Number(relatedProduct.price) : null, relatedProduct.currency)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: subject,
							onChange: (e) => setSubject(e.target.value),
							placeholder: "Konu (örn. Meşe dolap için özel ölçü fiyatı)",
							className: "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: body,
							onChange: (e) => setBody(e.target.value),
							rows: 4,
							placeholder: "Sorunuzu, ölçülerinizi veya merak ettiğiniz detayları buraya yazın…",
							className: "w-full rounded-xl border border-input bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-primary"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Sorunuz yönetici panelimize ve anlık e-posta bildirimine iletilir."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => createMessage.mutate(),
							disabled: !body.trim() || createMessage.isPending,
							className: "inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-xs font-semibold text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: createMessage.isPending ? "Gönderiliyor…" : "Soruyu Gönder" })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 grid gap-6 md:grid-cols-[300px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Konuşma Geçmişiniz"
						}),
						threadsLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Yükleniyor…"
						}),
						!threadsLoading && threads?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground",
							children: "Henüz soru kaydınız bulunmuyor."
						}),
						threads?.map((t) => {
							const isAnswered = t.status === "answered";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setActiveId(t.id),
								className: `w-full rounded-xl border p-3.5 text-left text-sm transition-all ${t.id === selectedId ? "border-primary bg-secondary shadow-sm" : "border-border hover:bg-secondary/60"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold line-clamp-1",
											children: t.subject || "Soru"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isAnswered ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`,
											children: isAnswered ? "Yanıtlandı" : "Bekliyor"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 line-clamp-1 text-xs text-muted-foreground",
										children: t.body
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-[10px] text-muted-foreground/70",
										children: new Date(t.created_at).toLocaleDateString("tr-TR", {
											day: "numeric",
											month: "short",
											hour: "2-digit",
											minute: "2-digit"
										})
									})
								]
							}, t.id);
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "panel flex flex-col justify-between p-6 min-h-[420px]",
					children: selectedThread ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-border pb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-xl font-semibold",
									children: selectedThread.subject || "Soru"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `rounded-full px-2.5 py-0.5 text-xs font-semibold ${selectedThread.status === "answered" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`,
									children: selectedThread.status === "answered" ? "Yanıtlandı" : "Cevap Bekliyor"
								})]
							}), selectedThread.products && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/urun/$productId",
								params: { productId: selectedThread.products.id },
								className: "mt-2 inline-flex items-center gap-2 text-xs text-primary hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Ürün: ", selectedThread.products.name] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-[85%] rounded-2xl rounded-tl-md bg-secondary p-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11px] font-semibold text-muted-foreground mb-1",
									children: "Siz"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap",
									children: selectedThread.body
								})]
							}), replies?.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: r.from_admin ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-ink p-4 text-sm text-ink-foreground shadow-sm" : "max-w-[85%] rounded-2xl rounded-tl-md bg-secondary p-4 text-sm",
								children: [
									r.from_admin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Almir Mobilya Yetkilisi" })]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[11px] font-semibold text-muted-foreground mb-1",
										children: "Siz"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "whitespace-pre-wrap",
										children: r.body
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-right text-[10px] opacity-60",
										children: new Date(r.created_at).toLocaleTimeString("tr-TR", {
											hour: "2-digit",
											minute: "2-digit"
										})
									})
								]
							}, r.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 border-t border-border pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: reply,
									onChange: (e) => setReply(e.target.value),
									placeholder: "Yanıtınızı buraya yazın…",
									className: "flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary",
									onKeyDown: (e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											if (reply.trim()) sendReply.mutate();
										}
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => sendReply.mutate(),
									disabled: !reply.trim() || sendReply.isPending,
									className: "rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
									children: "Gönder"
								})]
							})
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "m-auto text-center py-12 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mx-auto size-8 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm",
							children: "Görüntülemek için soldaki bir soruyu seçin."
						})]
					})
				})]
			})
		]
	});
}
//#endregion
export { MessagesPage as component };
