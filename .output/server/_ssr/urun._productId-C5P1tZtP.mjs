import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DxLTTzyN.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as formatPrice } from "./format-zQdBECWS.mjs";
import { A as ChevronLeft, C as Factory, D as CircleCheck, O as ChevronUp, h as Maximize2, i as Sparkles, j as ChevronDown, k as ChevronRight, l as Ruler, n as Truck, p as MessageSquare, s as ShieldCheck, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useAuth, n as AuthModal } from "./AuthModal-C56nx3nQ.mjs";
import { t as notifyAdminsOnNewQuestion } from "./notifications-D42LmJ8Y.mjs";
import { r as insertMessage } from "./messages-tFNJ6S8J.mjs";
import { t as Route } from "./urun._productId-nl4lRe96.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/urun._productId-C5P1tZtP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductPage() {
	const { productId } = Route.useParams();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [activeImageIdx, setActiveImageIdx] = (0, import_react.useState)(0);
	const [zoomOpen, setZoomOpen] = (0, import_react.useState)(false);
	const [showMore, setShowMore] = (0, import_react.useState)(false);
	const [authModalOpen, setAuthModalOpen] = (0, import_react.useState)(false);
	const [questionBody, setQuestionBody] = (0, import_react.useState)("");
	const [questionSent, setQuestionSent] = (0, import_react.useState)(false);
	const { data, isLoading } = useQuery({
		queryKey: ["product", productId],
		queryFn: async () => {
			const { data: product, error } = await supabase.from("products").select("*, subcategories(*, categories(*))").eq("id", productId).maybeSingle();
			if (error) throw error;
			return product;
		}
	});
	const sendQuestionMutation = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Giriş yapmanız gerekmektedir.");
			if (!data) throw new Error("Ürün bulunamadı.");
			const subjectText = `${data.name} hakkında soru`;
			const inserted = await insertMessage({
				user_id: user.id,
				user_email: user.email ?? null,
				user_name: user.user_metadata?.["full_name"] ?? null,
				subject: subjectText,
				body: questionBody.trim(),
				product_id: data.id,
				product: {
					id: data.id,
					name: data.name,
					image_url: data.image_url ?? null,
					price: data.price ?? null,
					currency: data.currency ?? "TRY"
				}
			});
			notifyAdminsOnNewQuestion({
				messageId: inserted.id,
				subject: subjectText,
				body: questionBody.trim(),
				userEmail: user.email ?? null,
				userName: user.user_metadata?.["full_name"] ?? null,
				productId: data.id,
				productName: data.name
			});
			return inserted;
		},
		onSuccess: () => {
			setQuestionBody("");
			setQuestionSent(true);
			toast.success("Sorunuz Almir Mobilya ekibine iletildi!", { description: "Yanıt geldiğinde Sohbet sayfasından takip edebilirsiniz." });
			queryClient.invalidateQueries({ queryKey: ["my-messages"] });
		},
		onError: (err) => {
			toast.error("Soru gönderilemedi: " + (err.message || "Lütfen tekrar deneyin."));
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 py-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-48 animate-pulse rounded bg-secondary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-10 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[4/5] animate-pulse rounded-2xl bg-secondary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-3/4 animate-pulse rounded bg-secondary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 animate-pulse rounded bg-secondary" })]
			})]
		})]
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Ürün Bulunamadı"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted-foreground",
				children: "Aradığınız ürün mevcut değil veya kaldırılmış olabilir."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground",
				children: "Ana Sayfaya Dön"
			})
		]
	});
	const sub = data.subcategories;
	const cat = sub?.categories;
	const extras = data.extra_specs ?? {};
	const rawImages = [data.image_url, ...Array.isArray(data.gallery) ? data.gallery : []];
	const images = Array.from(new Set(rawImages.filter((img) => Boolean(img && img.trim()))));
	if (images.length === 0) images.push(sub?.image_url || "/images/kategori-dolap.jpg");
	const currentImage = images[activeImageIdx] || images[0];
	const handlePrevImage = () => {
		setActiveImageIdx((prev) => prev > 0 ? prev - 1 : images.length - 1);
	};
	const handleNextImage = () => {
		setActiveImageIdx((prev) => prev < images.length - 1 ? prev + 1 : 0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "hover:text-foreground",
						children: "Ana Sayfa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
					cat && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/kategori/$category",
						params: { category: cat.slug },
						className: "hover:text-foreground",
						children: cat.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" })] }),
					cat && sub && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/katalog/$category/$subcategory",
						params: {
							category: cat.slug,
							subcategory: sub.slug
						},
						className: "hover:text-foreground",
						children: sub.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: data.name
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: currentImage,
							alt: `${data.name} - Görsel ${activeImageIdx + 1}`,
							width: 1400,
							height: 1750,
							className: "h-full w-full object-cover transition-all duration-300"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setZoomOpen(true),
							className: "absolute right-4 top-4 rounded-full bg-background/85 p-2.5 text-foreground backdrop-blur-md transition-transform hover:scale-105 shadow-md",
							title: "Tam boyutta incele",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-4" })
						}),
						images.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handlePrevImage,
							className: "absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background shadow-md",
							"aria-label": "Önceki görsel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handleNextImage,
							className: "absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background shadow-md",
							"aria-label": "Sonraki görsel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
						})] }),
						images.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md",
							children: [
								activeImageIdx + 1,
								" / ",
								images.length
							]
						})
					]
				}), images.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex gap-3 overflow-x-auto pb-2",
					children: images.map((img, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveImageIdx(idx),
						className: `relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${idx === activeImageIdx ? "border-primary ring-2 ring-primary/30" : "border-border opacity-70 hover:opacity-100"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: img,
							alt: `${data.name} thumbnail ${idx + 1}`,
							className: "h-full w-full object-cover"
						})
					}, idx))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-block rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold text-foreground",
						children: sub.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl",
						children: data.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-baseline gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl font-bold text-primary sm:text-4xl",
							children: formatPrice(data.price ? Number(data.price) : null, data.currency)
						}), data.price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "KDV Dahil / Özel Ölçü Baz Fiyat"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-base leading-relaxed text-muted-foreground",
						children: data.description || data.summary || "Özel ölçüye ve mekanınıza uygun olarak üretilmektedir."
					}),
					Array.isArray(data.materials) && data.materials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 border-t border-border pt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kullanılan Malzemeler" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: data.materials.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-lg border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground",
								children: m
							}, m))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 border-t border-border pt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ruler, { className: "size-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Standart Ölçüler" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-3 gap-2 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border bg-card p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: "Genişlik"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-base font-semibold",
										children: data.width_cm ? `${data.width_cm} cm` : "Özel"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border bg-card p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: "Yükseklik"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-base font-semibold",
										children: data.height_cm ? `${data.height_cm} cm` : "Özel"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border bg-card p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: "Derinlik"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-base font-semibold",
										children: data.depth_cm ? `${data.depth_cm} cm` : "Özel"
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setShowMore((v) => !v),
							className: "flex w-full items-center justify-between rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: showMore ? "Daha Az Teknik Detay" : "Daha Fazla Bilgi ve Teknik Detaylar" }), showMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" })]
						}), showMore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel mt-3 divide-y divide-border p-4 text-sm animate-in fade-in-50 duration-200",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" }),
									label: "Garanti Süresi",
									value: data.warranty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-4 text-primary" }),
									label: "Teslimat Süresi",
									value: data.delivery_time
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Factory, { className: "size-4 text-primary" }),
									label: "Üretim Yeri",
									value: data.production_place
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
									label: "Ağırlık",
									value: data.weight
								}),
								Object.entries(extras).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
									label: k,
									value: String(v)
								}, k))
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-lg font-semibold text-foreground",
									children: "Bu Ürün Hakkında Soru Sorun"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Ölçü değişikliği, renk kartelası veya özel fiyat taleplerinizi doğrudan atölyemize iletin."
							}),
							user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 space-y-3",
								children: questionSent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sorunuz başarıyla iletildi!" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: "Yöneticimiz yanıtladığında Sohbet sayfasından konuşmayı takip edebilirsiniz."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/mesajlar",
												className: "rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground",
												children: "Sohbete Git"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setQuestionSent(false),
												className: "rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium",
												children: "Yeni Soru Yaz"
											})]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: questionBody,
									onChange: (e) => setQuestionBody(e.target.value),
									rows: 3,
									placeholder: `${data.name} için aklınıza takılan soruyu, oda ölçülerinizi veya talebinizi yazın…`,
									className: "w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] text-muted-foreground",
										children: [user.email, " olarak gönderiliyor"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => sendQuestionMutation.mutate(),
										disabled: !questionBody.trim() || sendQuestionMutation.isPending,
										className: "rounded-full bg-ink px-5 py-2 text-xs font-semibold text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
										children: sendQuestionMutation.isPending ? "İletiliyor…" : "Soruyu İlet"
									})]
								})] })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-xl border border-border bg-background p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Sorunuzu iletebilmek ve yöneticimizin yanıtını takip edebilmek için Google ile giriş yapmanız gerekmektedir."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setAuthModalOpen(true),
									className: "mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Giriş Yap ve Soru Sor" })
								})]
							})
						]
					})
				] })]
			}),
			zoomOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md",
				onClick: () => setZoomOpen(false),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setZoomOpen(false),
					className: "absolute right-6 top-6 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25",
					"aria-label": "Kapat",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: currentImage,
					alt: data.name,
					className: "max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl",
					onClick: (e) => e.stopPropagation()
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthModal, {
				isOpen: authModalOpen,
				onClose: () => setAuthModalOpen(false)
			})
		]
	});
}
function DetailRow({ icon, label, value }) {
	if (!value) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between py-2.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-muted-foreground",
			children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-foreground",
			children: value
		})]
	});
}
//#endregion
export { ProductPage as component };
