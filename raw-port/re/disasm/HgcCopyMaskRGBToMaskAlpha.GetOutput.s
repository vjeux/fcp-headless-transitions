__ZN25HgcCopyMaskRGBToMaskAlpha9GetOutputEP10HGRenderer:
00000000006a2dc0	pushq	%rbp
00000000006a2dc1	movq	%rsp, %rbp
00000000006a2dc4	subq	$0x20, %rsp
00000000006a2dc8	movq	%rdi, -0x8(%rbp)
00000000006a2dcc	movq	%rsi, -0x10(%rbp)
00000000006a2dd0	movq	-0x8(%rbp), %rax
00000000006a2dd4	movq	%rax, -0x18(%rbp)
00000000006a2dd8	cmpl	$0x0, 0x1f8(%rax)
00000000006a2ddf	je	0x6a2e43
00000000006a2de1	movq	-0x18(%rbp), %rdi
00000000006a2de5	xorl	%eax, %eax
00000000006a2de7	movl	%eax, %esi
00000000006a2de9	callq	__ZN25HgcCopyMaskRGBToMaskAlpha5SetupEPv ## HgcCopyMaskRGBToMaskAlpha::Setup(void*)
00000000006a2dee	movq	-0x18(%rbp), %rax
00000000006a2df2	movq	0x1f0(%rax), %rcx
00000000006a2df9	movaps	(%rcx), %xmm0
00000000006a2dfc	movaps	%xmm0, 0x1b0(%rax)
00000000006a2e03	movq	0x1f0(%rax), %rcx
00000000006a2e0a	movaps	0x20(%rcx), %xmm0
00000000006a2e0e	movaps	%xmm0, 0x1c0(%rax)
00000000006a2e15	movq	0x1f0(%rax), %rcx
00000000006a2e1c	movaps	0x40(%rcx), %xmm0
00000000006a2e20	movaps	%xmm0, 0x1d0(%rax)
00000000006a2e27	movq	0x1f0(%rax), %rcx
00000000006a2e2e	movaps	0x60(%rcx), %xmm0
00000000006a2e32	movaps	%xmm0, 0x1e0(%rax)
00000000006a2e39	movl	$0x0, 0x1f8(%rax)
00000000006a2e43	movq	-0x18(%rbp), %rdi
00000000006a2e47	movq	-0x10(%rbp), %rsi
00000000006a2e4b	callq	0x6dd7b2                        ## symbol stub for: __ZN13HGColorMatrix9GetOutputEP10HGRenderer
00000000006a2e50	addq	$0x20, %rsp
00000000006a2e54	popq	%rbp
00000000006a2e55	retq
00000000006a2e56	nopw	%cs:(%rax,%rax)
