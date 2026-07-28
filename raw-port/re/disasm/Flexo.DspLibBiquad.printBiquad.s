__ZN12DspLibBiquad11printBiquadEj:
0000000001229a10	pushq	%rbp
0000000001229a11	movq	%rsp, %rbp
0000000001229a14	pushq	%r14
0000000001229a16	pushq	%rbx
0000000001229a17	movl	%esi, %r14d
0000000001229a1a	movq	%rdi, %rbx
0000000001229a1d	movl	0x18(%rdi), %esi
0000000001229a20	leaq	0x45758b(%rip), %rdi            ## literal pool for: "\nSample rate = %u"
0000000001229a27	xorl	%eax, %eax
0000000001229a29	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229a2e	movl	$0xa, %edi
0000000001229a33	callq	0x1497b30                       ## symbol stub for: _putchar
0000000001229a38	movq	(%rbx), %rax
0000000001229a3b	movl	%r14d, %ecx
0000000001229a3e	imulq	$0x38, %rcx, %r14
0000000001229a42	movss	0x2c(%rax,%r14), %xmm0
0000000001229a49	cvtss2sd	%xmm0, %xmm0
0000000001229a4d	leaq	0x457570(%rip), %rdi            ## literal pool for: "\nFc = %f"
0000000001229a54	movb	$0x1, %al
0000000001229a56	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229a5b	movq	(%rbx), %rax
0000000001229a5e	movss	0x30(%rax,%r14), %xmm0
0000000001229a65	cvtss2sd	%xmm0, %xmm0
0000000001229a69	leaq	0x45755d(%rip), %rdi            ## literal pool for: "\nQ = %f"
0000000001229a70	movb	$0x1, %al
0000000001229a72	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229a77	movq	(%rbx), %rax
0000000001229a7a	movss	0x34(%rax,%r14), %xmm0
0000000001229a81	cvtss2sd	%xmm0, %xmm0
0000000001229a85	leaq	0x457549(%rip), %rdi            ## literal pool for: "\nGain = %f"
0000000001229a8c	movb	$0x1, %al
0000000001229a8e	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229a93	movq	(%rbx), %rax
0000000001229a96	leaq	0x457550(%rip), %rcx            ## literal pool for: "true"
0000000001229a9d	leaq	0x3de7e6(%rip), %rsi            ## literal pool for: "false"
0000000001229aa4	cmpb	$0x0, 0x24(%rax,%r14)
0000000001229aaa	cmovneq	%rcx, %rsi
0000000001229aae	leaq	0x45752b(%rip), %rdi            ## literal pool for: "\nBypass = %s"
0000000001229ab5	xorl	%eax, %eax
0000000001229ab7	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229abc	movq	(%rbx), %rax
0000000001229abf	movl	0x28(%rax,%r14), %esi
0000000001229ac4	leaq	0x457527(%rip), %rdi            ## literal pool for: "\nType = %u"
0000000001229acb	xorl	%eax, %eax
0000000001229acd	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229ad2	movl	$0xa, %edi
0000000001229ad7	callq	0x1497b30                       ## symbol stub for: _putchar
0000000001229adc	movq	(%rbx), %rax
0000000001229adf	movss	0xc(%rax,%r14), %xmm0
0000000001229ae6	cvtss2sd	%xmm0, %xmm0
0000000001229aea	leaq	0x45750c(%rip), %rdi            ## literal pool for: "\na1 = %1.15f"
0000000001229af1	movb	$0x1, %al
0000000001229af3	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229af8	movq	(%rbx), %rax
0000000001229afb	movss	0x10(%rax,%r14), %xmm0
0000000001229b02	cvtss2sd	%xmm0, %xmm0
0000000001229b06	leaq	0x4574fd(%rip), %rdi            ## literal pool for: "\na2 = %1.15f"
0000000001229b0d	movb	$0x1, %al
0000000001229b0f	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229b14	movq	(%rbx), %rax
0000000001229b17	movss	(%rax,%r14), %xmm0
0000000001229b1d	cvtss2sd	%xmm0, %xmm0
0000000001229b21	leaq	0x4574ef(%rip), %rdi            ## literal pool for: "\nb0 = %1.15f"
0000000001229b28	movb	$0x1, %al
0000000001229b2a	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229b2f	movq	(%rbx), %rax
0000000001229b32	movss	0x4(%rax,%r14), %xmm0
0000000001229b39	cvtss2sd	%xmm0, %xmm0
0000000001229b3d	leaq	0x4574e0(%rip), %rdi            ## literal pool for: "\nb1 = %1.15f"
0000000001229b44	movb	$0x1, %al
0000000001229b46	callq	0x1497a52                       ## symbol stub for: _printf
0000000001229b4b	movq	(%rbx), %rax
0000000001229b4e	movss	0x8(%rax,%r14), %xmm0
0000000001229b55	cvtss2sd	%xmm0, %xmm0
0000000001229b59	leaq	0x4574d1(%rip), %rdi            ## literal pool for: "\nb2 = %1.15f"
0000000001229b60	movb	$0x1, %al
0000000001229b62	popq	%rbx
0000000001229b63	popq	%r14
0000000001229b65	popq	%rbp
0000000001229b66	jmp	0x1497a52                       ## symbol stub for: _printf
0000000001229b6b	nopl	(%rax,%rax)
