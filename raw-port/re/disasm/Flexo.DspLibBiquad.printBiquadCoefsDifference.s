__ZN12DspLibBiquad26printBiquadCoefsDifferenceEjddddd:
0000000001229b70	pushq	%rbp
0000000001229b71	movq	%rsp, %rbp
0000000001229b74	pushq	%r14
0000000001229b76	pushq	%rbx
0000000001229b77	subq	$0x20, %rsp
0000000001229b7b	movsd	%xmm4, -0x30(%rbp)
0000000001229b80	movsd	%xmm3, -0x28(%rbp)
0000000001229b85	movsd	%xmm2, -0x20(%rbp)
0000000001229b8a	movsd	%xmm1, -0x18(%rbp)
0000000001229b8f	movq	%rdi, %rbx
0000000001229b92	movq	(%rdi), %rax
0000000001229b95	movl	%esi, %ecx
0000000001229b97	imulq	$0x38, %rcx, %r14
0000000001229b9b	movss	0xc(%rax,%r14), %xmm1
0000000001229ba2	cvtss2sd	%xmm1, %xmm1
0000000001229ba6	subsd	%xmm0, %xmm1
0000000001229baa	leaq	0x45748d(%rip), %rdi            ## literal pool for: "\na1 diff = %1.15f"
0000000001229bb1	movapd	%xmm1, %xmm0
0000000001229bb5	movb	$0x1, %al
0000000001229bb7	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229bbc	movq	(%rbx), %rax
0000000001229bbf	movss	0x10(%rax,%r14), %xmm0
0000000001229bc6	cvtss2sd	%xmm0, %xmm0
0000000001229bca	subsd	-0x18(%rbp), %xmm0
0000000001229bcf	leaq	0x45747a(%rip), %rdi            ## literal pool for: "\na2 diff = %1.15f"
0000000001229bd6	movb	$0x1, %al
0000000001229bd8	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229bdd	movq	(%rbx), %rax
0000000001229be0	movss	(%rax,%r14), %xmm0
0000000001229be6	cvtss2sd	%xmm0, %xmm0
0000000001229bea	subsd	-0x20(%rbp), %xmm0
0000000001229bef	leaq	0x45746c(%rip), %rdi            ## literal pool for: "\nb0 diff = %1.15f"
0000000001229bf6	movb	$0x1, %al
0000000001229bf8	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229bfd	movq	(%rbx), %rax
0000000001229c00	movss	0x4(%rax,%r14), %xmm0
0000000001229c07	cvtss2sd	%xmm0, %xmm0
0000000001229c0b	subsd	-0x28(%rbp), %xmm0
0000000001229c10	leaq	0x45745d(%rip), %rdi            ## literal pool for: "\nb1 diff = %1.15f"
0000000001229c17	movb	$0x1, %al
0000000001229c19	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229c1e	movq	(%rbx), %rax
0000000001229c21	movss	0x8(%rax,%r14), %xmm0
0000000001229c28	cvtss2sd	%xmm0, %xmm0
0000000001229c2c	subsd	-0x30(%rbp), %xmm0
0000000001229c31	leaq	0x45744e(%rip), %rdi            ## literal pool for: "\nb2 diff = %1.15f"
0000000001229c38	movb	$0x1, %al
0000000001229c3a	addq	$0x20, %rsp
0000000001229c3e	popq	%rbx
0000000001229c3f	popq	%r14
0000000001229c41	popq	%rbp
0000000001229c42	jmp	0x1497a52                       ## symbol stub for: _printf
0000000001229c47	nopw	(%rax,%rax)
