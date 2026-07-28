__ZN15OZElementRenderD0Ev:
0000000000451550	pushq	%rbp
0000000000451551	movq	%rsp, %rbp
0000000000451554	pushq	%r14
0000000000451556	pushq	%rbx
0000000000451557	movq	%rdi, %rbx
000000000045155a	leaq	0x41621f(%rip), %rax
0000000000451561	movq	%rax, (%rdi)
0000000000451564	leaq	0x5d8(%rdi), %r14
000000000045156b	leaq	0x416306(%rip), %rax
0000000000451572	movq	%rax, 0x5d8(%rdi)
0000000000451579	leaq	0x4163c0(%rip), %rax
0000000000451580	movq	%rax, 0x5e8(%rdi)
0000000000451587	addq	$0x10, %rdi
000000000045158b	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
0000000000451590	leaq	0x4161a9(%rip), %rsi
0000000000451597	movq	%r14, %rdi
000000000045159a	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
000000000045159f	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000004515a6	addq	$0x10, %rax
00000000004515aa	movq	%rax, 0x5e8(%rbx)
00000000004515b1	movq	0x5f0(%rbx), %rdi
00000000004515b8	testq	%rdi, %rdi
00000000004515bb	je	0x4515c2
00000000004515bd	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
00000000004515c2	movq	%rbx, %rdi
00000000004515c5	popq	%rbx
00000000004515c6	popq	%r14
00000000004515c8	popq	%rbp
00000000004515c9	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004515ce	movq	%rax, %rdi
00000000004515d1	callq	___clang_call_terminate
00000000004515d6	nopw	%cs:(%rax,%rax)
