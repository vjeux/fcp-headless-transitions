__ZN6PCMath5clampERK6CMTimeS2_S2_:
000000000003a438	pushq	%rbp
000000000003a439	movq	%rsp, %rbp
000000000003a43c	pushq	%r15
000000000003a43e	pushq	%r14
000000000003a440	pushq	%r12
000000000003a442	pushq	%rbx
000000000003a443	subq	$0x70, %rsp
000000000003a447	movq	%rcx, %r14
000000000003a44a	movq	%rdx, %r12
000000000003a44d	movq	%rsi, %r15
000000000003a450	movq	%rdi, %rbx
000000000003a453	movq	0x10(%rsi), %rax
000000000003a457	movq	%rax, -0x50(%rbp)
000000000003a45b	movups	(%rsi), %xmm0
000000000003a45e	movaps	%xmm0, -0x60(%rbp)
000000000003a462	movq	0x10(%rdx), %rax
000000000003a466	movq	%rax, -0x30(%rbp)
000000000003a46a	movups	(%rdx), %xmm0
000000000003a46d	movaps	%xmm0, -0x40(%rbp)
000000000003a471	movq	-0x30(%rbp), %rax
000000000003a475	movq	%rax, 0x28(%rsp)
000000000003a47a	movaps	-0x40(%rbp), %xmm0
000000000003a47e	movups	%xmm0, 0x18(%rsp)
000000000003a483	movq	-0x50(%rbp), %rax
000000000003a487	movq	%rax, 0x10(%rsp)
000000000003a48c	movaps	-0x60(%rbp), %xmm0
000000000003a490	movups	%xmm0, (%rsp)
000000000003a494	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003a499	testl	%eax, %eax
000000000003a49b	js	0x3a4ee
000000000003a49d	movq	0x10(%r15), %rax
000000000003a4a1	movq	%rax, -0x50(%rbp)
000000000003a4a5	movups	(%r15), %xmm0
000000000003a4a9	movaps	%xmm0, -0x60(%rbp)
000000000003a4ad	movq	0x10(%r14), %rax
000000000003a4b1	movq	%rax, -0x30(%rbp)
000000000003a4b5	movups	(%r14), %xmm0
000000000003a4b9	movaps	%xmm0, -0x40(%rbp)
000000000003a4bd	movq	-0x30(%rbp), %rax
000000000003a4c1	movq	%rax, 0x28(%rsp)
000000000003a4c6	movaps	-0x40(%rbp), %xmm0
000000000003a4ca	movups	%xmm0, 0x18(%rsp)
000000000003a4cf	movq	-0x50(%rbp), %rax
000000000003a4d3	movq	%rax, 0x10(%rsp)
000000000003a4d8	movaps	-0x60(%rbp), %xmm0
000000000003a4dc	movups	%xmm0, (%rsp)
000000000003a4e0	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000003a4e5	testl	%eax, %eax
000000000003a4e7	cmovgq	%r14, %r15
000000000003a4eb	movq	%r15, %r12
000000000003a4ee	movq	0x10(%r12), %rax
000000000003a4f3	movq	%rax, 0x10(%rbx)
000000000003a4f7	movups	(%r12), %xmm0
000000000003a4fc	movups	%xmm0, (%rbx)
000000000003a4ff	movq	%rbx, %rax
000000000003a502	addq	$0x70, %rsp
000000000003a506	popq	%rbx
000000000003a507	popq	%r12
000000000003a509	popq	%r14
000000000003a50b	popq	%r15
000000000003a50d	popq	%rbp
000000000003a50e	retq
000000000003a50f	nop
