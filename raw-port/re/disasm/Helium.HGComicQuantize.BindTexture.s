__ZN15HGComicQuantize11BindTextureEP9HGHandleri:
0000000000007e50	pushq	%rbp
0000000000007e51	movq	%rsp, %rbp
0000000000007e54	pushq	%r14
0000000000007e56	pushq	%rbx
0000000000007e57	subq	$0x10, %rsp
0000000000007e5b	movl	%edx, %r14d
0000000000007e5e	movq	%rsi, %rbx
0000000000007e61	testl	%edx, %edx
0000000000007e63	js	0x7ea9
0000000000007e65	movss	0x3bfe53(%rip), %xmm0
0000000000007e6d	divss	0x19c(%rdi), %xmm0
0000000000007e75	movss	%xmm0, -0x14(%rbp)
0000000000007e7a	movq	%rbx, %rdi
0000000000007e7d	movl	%r14d, %esi
0000000000007e80	xorl	%edx, %edx
0000000000007e82	xorl	%ecx, %ecx
0000000000007e84	xorl	%r8d, %r8d
0000000000007e87	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
0000000000007e8c	movss	-0x14(%rbp), %xmm0
0000000000007e91	cvtss2sd	%xmm0, %xmm0
0000000000007e95	movq	(%rbx), %rax
0000000000007e98	movsd	0x3c23c0(%rip), %xmm2
0000000000007ea0	movq	%rbx, %rdi
0000000000007ea3	movaps	%xmm0, %xmm1
0000000000007ea6	callq	*0x68(%rax)
0000000000007ea9	movq	(%rbx), %rax
0000000000007eac	movq	%rbx, %rdi
0000000000007eaf	movl	%r14d, %esi
0000000000007eb2	xorl	%edx, %edx
0000000000007eb4	callq	*0x48(%rax)
0000000000007eb7	movq	(%rbx), %rax
0000000000007eba	movq	%rbx, %rdi
0000000000007ebd	xorl	%esi, %esi
0000000000007ebf	callq	*0x38(%rax)
0000000000007ec2	movq	(%rbx), %rax
0000000000007ec5	movq	%rbx, %rdi
0000000000007ec8	movl	$0x1, %esi
0000000000007ecd	movl	$0x1, %edx
0000000000007ed2	callq	*0x30(%rax)
0000000000007ed5	xorl	%eax, %eax
0000000000007ed7	addq	$0x10, %rsp
0000000000007edb	popq	%rbx
0000000000007edc	popq	%r14
0000000000007ede	popq	%rbp
0000000000007edf	retq
