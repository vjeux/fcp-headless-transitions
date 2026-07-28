__ZN24OZInterpolatorStrategies15getInterpolatorEj:
0000000000044ddc	pushq	%rbp
0000000000044ddd	movq	%rsp, %rbp
0000000000044de0	movl	$0x18, %eax
0000000000044de5	cmpl	$0x15, %esi
0000000000044de8	ja	0x44df7
0000000000044dea	movl	%esi, %eax
0000000000044dec	leaq	0x6bb65(%rip), %rcx
0000000000044df3	movq	(%rcx,%rax,8), %rax
0000000000044df7	movq	(%rdi,%rax), %rax
0000000000044dfb	popq	%rbp
0000000000044dfc	retq
0000000000044dfd	nop
