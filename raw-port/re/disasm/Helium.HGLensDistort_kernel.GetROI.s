__ZN20HGLensDistort_kernel6GetROIEP10HGRendereri6HGRect:
000000000022a390	pushq	%rbp
000000000022a391	movq	%rsp, %rbp
000000000022a394	pushq	%rbx
000000000022a395	pushq	%rax
000000000022a396	movq	%r8, %rdx
000000000022a399	movq	%rdi, %rbx
000000000022a39c	movq	(%rdi), %rax
000000000022a39f	movq	%rcx, %rsi
000000000022a3a2	callq	*0x230(%rax)
000000000022a3a8	movq	0x198(%rbx), %r8
000000000022a3af	movq	0x1a0(%rbx), %rcx
000000000022a3b6	movq	%rax, %rdi
000000000022a3b9	movq	%rdx, %rsi
000000000022a3bc	movq	%r8, %rdx
000000000022a3bf	callq	_HGRectIntersection
000000000022a3c4	movq	%rdx, %xmm0
000000000022a3c9	movq	%rax, %xmm1
000000000022a3ce	punpcklqdq	%xmm0, %xmm1            ## xmm1 = xmm1[0],xmm0[0]
000000000022a3d2	movdqa	0x663056(%rip), %xmm0
000000000022a3da	paddq	%xmm1, %xmm0
000000000022a3de	pblendw	$0xcc, %xmm1, %xmm0             ## xmm0 = xmm0[0,1],xmm1[2,3],xmm0[4,5],xmm1[6,7]
000000000022a3e4	paddq	0x663054(%rip), %xmm0
000000000022a3ec	movq	%xmm0, %rax
000000000022a3f1	pextrq	$0x1, %xmm0, %rdx
000000000022a3f8	addq	$0x8, %rsp
000000000022a3fc	popq	%rbx
000000000022a3fd	popq	%rbp
000000000022a3fe	retq
000000000022a3ff	nop
