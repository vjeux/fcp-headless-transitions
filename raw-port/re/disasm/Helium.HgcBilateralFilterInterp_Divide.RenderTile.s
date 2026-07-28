__ZN31HgcBilateralFilterInterp_Divide10RenderTileEP6HGTile:
000000000031a9c0	pushq	%rbp
000000000031a9c1	movq	%rsp, %rbp
000000000031a9c4	pushq	%r15
000000000031a9c6	pushq	%r14
000000000031a9c8	pushq	%rbx
000000000031a9c9	pushq	%rax
000000000031a9ca	movq	%rsi, %r14
000000000031a9cd	movq	%rdi, %rbx
000000000031a9d0	movq	%rsi, %rdi
000000000031a9d3	callq	__ZNK6HGTile8RendererEv         ## HGTile::Renderer() const
000000000031a9d8	movq	%rax, %rdi
000000000031a9db	xorl	%esi, %esi
000000000031a9dd	callq	__ZN10HGRenderer9GetTargetEj    ## HGRenderer::GetTarget(unsigned int)
000000000031a9e2	cmpl	$0x4700000, %eax                ## imm = 0x4700000
000000000031a9e7	jb	0x31a9f9
000000000031a9e9	movq	%rbx, %rdi
000000000031a9ec	movq	%r14, %rsi
000000000031a9ef	callq	__ZN31HgcBilateralFilterInterp_Divide14RenderTile_AVXEP6HGTile ## HgcBilateralFilterInterp_Divide::RenderTile_AVX(HGTile*)
000000000031a9f4	jmp	0x31aaad
000000000031a9f9	movl	0xc(%r14), %eax
000000000031a9fd	subl	0x4(%r14), %eax
000000000031aa01	jle	0x31aaad
000000000031aa07	movl	0x8(%r14), %r10d
000000000031aa0b	subl	(%r14), %r10d
000000000031aa0e	testl	%r10d, %r10d
000000000031aa11	jle	0x31aaad
000000000031aa17	movslq	0x18(%r14), %rcx
000000000031aa1b	movslq	0x68(%r14), %rdx
000000000031aa1f	movslq	0x58(%r14), %rsi
000000000031aa23	movq	0x10(%r14), %rdi
000000000031aa27	movq	0x50(%r14), %r8
000000000031aa2b	movq	0x60(%r14), %r9
000000000031aa2f	movl	%r10d, %r10d
000000000031aa32	shlq	$0x4, %rsi
000000000031aa36	shlq	$0x4, %rdx
000000000031aa3a	shlq	$0x4, %rcx
000000000031aa3e	shlq	$0x4, %r10
000000000031aa42	xorl	%r11d, %r11d
000000000031aa45	nopw	%cs:(%rax,%rax)
000000000031aa50	xorl	%r14d, %r14d
000000000031aa53	nopw	%cs:(%rax,%rax)
000000000031aa60	movaps	(%r9,%r14), %xmm0
000000000031aa65	movq	0x198(%rbx), %r15
000000000031aa6c	movaps	(%r15), %xmm1
000000000031aa70	movaps	0x20(%r15), %xmm2
000000000031aa75	minps	%xmm1, %xmm0
000000000031aa78	maxps	%xmm2, %xmm0
000000000031aa7b	rcpps	%xmm0, %xmm0
000000000031aa7e	mulps	0x40(%r15), %xmm0
000000000031aa83	minps	%xmm1, %xmm0
000000000031aa86	maxps	%xmm2, %xmm0
000000000031aa89	mulps	(%r8,%r14), %xmm0
000000000031aa8e	movaps	%xmm0, (%rdi,%r14)
000000000031aa93	addq	$0x10, %r14
000000000031aa97	cmpq	%r14, %r10
000000000031aa9a	jne	0x31aa60
000000000031aa9c	incl	%r11d
000000000031aa9f	addq	%rsi, %r8
000000000031aaa2	addq	%rdx, %r9
000000000031aaa5	addq	%rcx, %rdi
000000000031aaa8	cmpl	%eax, %r11d
000000000031aaab	jne	0x31aa50
000000000031aaad	xorl	%eax, %eax
000000000031aaaf	addq	$0x8, %rsp
000000000031aab3	popq	%rbx
000000000031aab4	popq	%r14
000000000031aab6	popq	%r15
000000000031aab8	popq	%rbp
000000000031aab9	retq
000000000031aaba	nopw	(%rax,%rax)
