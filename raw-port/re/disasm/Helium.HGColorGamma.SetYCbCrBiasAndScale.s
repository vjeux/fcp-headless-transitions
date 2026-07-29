__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv:
00000000000fb3e0	pushq	%rbp
00000000000fb3e1	movq	%rsp, %rbp
00000000000fb3e4	pushq	%rbx
00000000000fb3e5	subq	$0x28, %rsp
00000000000fb3e9	movq	%rdi, %rbx
00000000000fb3ec	movl	0x424(%rdi), %eax
00000000000fb3f2	cmpq	$0x1c, %rax
00000000000fb3f6	ja	0xfb4c3
00000000000fb3fc	movaps	0x2d44ed(%rip), %xmm0
00000000000fb403	leaq	0x19a(%rip), %rcx
00000000000fb40a	movslq	(%rcx,%rax,4), %rax
00000000000fb40e	addq	%rcx, %rax
00000000000fb411	jmpq	*%rax
00000000000fb413	movaps	0x2d4516(%rip), %xmm0
00000000000fb41a	movaps	%xmm0, -0x30(%rbp)
00000000000fb41e	movaps	0x2d451b(%rip), %xmm0
00000000000fb425	jmp	0xfb48b
00000000000fb427	movaps	0x2d44d2(%rip), %xmm1
00000000000fb42e	jmp	0xfb44b
00000000000fb430	movaps	0x2cc809(%rip), %xmm0
00000000000fb437	movaps	%xmm0, -0x30(%rbp)
00000000000fb43b	movaps	0x2d44ce(%rip), %xmm0
00000000000fb442	jmp	0xfb48b
00000000000fb444	movaps	0x2d44d5(%rip), %xmm1
00000000000fb44b	movaps	%xmm1, -0x20(%rbp)
00000000000fb44f	movaps	%xmm0, -0x30(%rbp)
00000000000fb453	jmp	0xfb48f
00000000000fb455	movaps	0x2cc7e4(%rip), %xmm0
00000000000fb45c	movaps	%xmm0, -0x30(%rbp)
00000000000fb460	movaps	0x2d44b9(%rip), %xmm0
00000000000fb467	jmp	0xfb48b
00000000000fb469	movaps	0x2cc7d0(%rip), %xmm0
00000000000fb470	movaps	%xmm0, -0x30(%rbp)
00000000000fb474	xorps	%xmm0, %xmm0
00000000000fb477	jmp	0xfb48b
00000000000fb479	movaps	0x2d44d0(%rip), %xmm0
00000000000fb480	movaps	%xmm0, -0x30(%rbp)
00000000000fb484	movaps	0x2d44d5(%rip), %xmm0
00000000000fb48b	movaps	%xmm0, -0x20(%rbp)
00000000000fb48f	movq	%rbx, %rdi
00000000000fb492	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb497	movb	$0x1, 0x2e9(%rbx)
00000000000fb49e	movaps	-0x20(%rbp), %xmm0
00000000000fb4a2	movaps	%xmm0, 0x450(%rbx)
00000000000fb4a9	movq	%rbx, %rdi
00000000000fb4ac	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb4b1	movb	$0x1, 0x2e9(%rbx)
00000000000fb4b8	movaps	-0x30(%rbp), %xmm0
00000000000fb4bc	movaps	%xmm0, 0x430(%rbx)
00000000000fb4c3	movl	0x428(%rbx), %eax
00000000000fb4c9	cmpq	$0x1c, %rax
00000000000fb4cd	ja	0xfb59a
00000000000fb4d3	movaps	0x2d4496(%rip), %xmm0
00000000000fb4da	leaq	0x137(%rip), %rcx
00000000000fb4e1	movslq	(%rcx,%rax,4), %rax
00000000000fb4e5	addq	%rcx, %rax
00000000000fb4e8	jmpq	*%rax
00000000000fb4ea	movaps	0x2d44bf(%rip), %xmm0
00000000000fb4f1	movaps	%xmm0, -0x30(%rbp)
00000000000fb4f5	movaps	0x2d44c4(%rip), %xmm0
00000000000fb4fc	jmp	0xfb562
00000000000fb4fe	movaps	0x2d447b(%rip), %xmm1
00000000000fb505	jmp	0xfb522
00000000000fb507	movaps	0x2cc732(%rip), %xmm0
00000000000fb50e	movaps	%xmm0, -0x30(%rbp)
00000000000fb512	movaps	0x2d4477(%rip), %xmm0
00000000000fb519	jmp	0xfb562
00000000000fb51b	movaps	0x2d447e(%rip), %xmm1
00000000000fb522	movaps	%xmm1, -0x20(%rbp)
00000000000fb526	movaps	%xmm0, -0x30(%rbp)
00000000000fb52a	jmp	0xfb566
00000000000fb52c	movaps	0x2cc70d(%rip), %xmm0
00000000000fb533	movaps	%xmm0, -0x30(%rbp)
00000000000fb537	movaps	0x2d4462(%rip), %xmm0
00000000000fb53e	jmp	0xfb562
00000000000fb540	movaps	0x2cc6f9(%rip), %xmm0
00000000000fb547	movaps	%xmm0, -0x30(%rbp)
00000000000fb54b	xorps	%xmm0, %xmm0
00000000000fb54e	jmp	0xfb562
00000000000fb550	movaps	0x2d4479(%rip), %xmm0
00000000000fb557	movaps	%xmm0, -0x30(%rbp)
00000000000fb55b	movaps	0x2d447e(%rip), %xmm0
00000000000fb562	movaps	%xmm0, -0x20(%rbp)
00000000000fb566	movq	%rbx, %rdi
00000000000fb569	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb56e	movb	$0x1, 0x2e9(%rbx)
00000000000fb575	movaps	-0x20(%rbp), %xmm0
00000000000fb579	movaps	%xmm0, 0x460(%rbx)
00000000000fb580	movq	%rbx, %rdi
00000000000fb583	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb588	movb	$0x1, 0x2e9(%rbx)
00000000000fb58f	movaps	-0x30(%rbp), %xmm0
00000000000fb593	movaps	%xmm0, 0x440(%rbx)
00000000000fb59a	addq	$0x28, %rsp
00000000000fb59e	popq	%rbx
00000000000fb59f	popq	%rbp
00000000000fb5a0	retq
00000000000fb5a1	nopl	(%rax)
00000000000fb5a4	.byte 0xc5 #bad opcode
00000000000fb5a5	.byte 0xfe #bad opcode
00000000000fb5a6	.byte 0xff #bad opcode
00000000000fb5a7	incl	-0x2a000002(%rbx)
00000000000fb5ad	.byte 0xfe #bad opcode
00000000000fb5ae	.byte 0xff #bad opcode
00000000000fb5af	ljmpl	*-0x2(%rdi)
00000000000fb5b2	.byte 0xff #bad opcode
00000000000fb5b3	jmpq	*-0x7c000002(%rax)
00000000000fb5b9	.byte 0xfe #bad opcode
00000000000fb5ba	.byte 0xff #bad opcode
00000000000fb5bb	ljmpl	*-0x2(%rdi)
00000000000fb5be	.byte 0xff #bad opcode
00000000000fb5bf	jmpq	*-0x7c000002(%rax)
00000000000fb5c5	.byte 0xfe #bad opcode
00000000000fb5c6	.byte 0xff #bad opcode
00000000000fb5c7	pushq	-0x7c000002(%rcx)
00000000000fb5cd	.byte 0xfe #bad opcode
00000000000fb5ce	.byte 0xff #bad opcode
00000000000fb5cf	pushq	0x6ffffffe(%rcx)
00000000000fb5d5	.byte 0xfe #bad opcode
00000000000fb5d6	.byte 0xff #bad opcode
00000000000fb5d7	decl	-0x1900001(%rsi,%rdi,8)
00000000000fb5de	.byte 0xff #bad opcode
00000000000fb5df	decl	-0x1900001(%rsi,%rdi,8)
00000000000fb5e6	.byte 0xff #bad opcode
00000000000fb5e7	decl	-0x17c0001(%rsi,%rdi,8)
00000000000fb5ee	.byte 0xff #bad opcode
00000000000fb5ef	ljmpl	*-0x2(%rdi)
00000000000fb5f2	.byte 0xff #bad opcode
00000000000fb5f3	ljmpl	*-0x2(%rdi)
00000000000fb5f6	.byte 0xff #bad opcode
00000000000fb5f7	ljmpl	*-0x2(%rdi)
00000000000fb5fa	.byte 0xff #bad opcode
00000000000fb5fb	ljmpl	*-0x2(%rdi)
00000000000fb5fe	.byte 0xff #bad opcode
00000000000fb5ff	ljmpl	*-0x2(%rdi)
00000000000fb602	.byte 0xff #bad opcode
00000000000fb603	ljmpl	*-0x2(%rdi)
00000000000fb606	.byte 0xff #bad opcode
00000000000fb607	incl	-0x73000002(%rbx)
00000000000fb60d	.byte 0xfe #bad opcode
00000000000fb60e	.byte 0xff #bad opcode
00000000000fb60f	ljmpl	*-0x2(%rdi)
00000000000fb612	.byte 0xff #bad opcode
00000000000fb613	ljmpl	*-0x2(%rdi)
00000000000fb616	.byte 0xff #bad opcode
00000000000fb617	ljmpl	*(%rax)
00000000000fb619	.byte 0xff #bad opcode
00000000000fb61a	.byte 0xff #bad opcode
00000000000fb61b	jmpq	*%rsi
00000000000fb61d	.byte 0xfe #bad opcode
00000000000fb61e	.byte 0xff #bad opcode
00000000000fb61f	.byte 0xff #bad opcode
00000000000fb620	cmpb	%bh, %bh
00000000000fb622	.byte 0xff #bad opcode
00000000000fb623	callq	*%rdx
00000000000fb625	.byte 0xfe #bad opcode
00000000000fb626	.byte 0xff #bad opcode
00000000000fb627	incl	(%rbx)
00000000000fb629	.byte 0xff #bad opcode
00000000000fb62a	.byte 0xff #bad opcode
00000000000fb62b	jmpq	*%rsi
00000000000fb62d	.byte 0xfe #bad opcode
00000000000fb62e	.byte 0xff #bad opcode
00000000000fb62f	callq	*%rdx
00000000000fb631	.byte 0xfe #bad opcode
00000000000fb632	.byte 0xff #bad opcode
00000000000fb633	incl	(%rbx)
00000000000fb635	.byte 0xff #bad opcode
00000000000fb636	.byte 0xff #bad opcode
00000000000fb637	jmpq	*%rsi
00000000000fb639	.byte 0xfe #bad opcode
00000000000fb63a	.byte 0xff #bad opcode
00000000000fb63b	callq	*(%rdi,%rdi,8)
00000000000fb63e	.byte 0xff #bad opcode
00000000000fb63f	jmpq	*%rsi
00000000000fb641	.byte 0xfe #bad opcode
00000000000fb642	.byte 0xff #bad opcode
00000000000fb643	callq	*(%rdi,%rdi,8)
00000000000fb646	.byte 0xff #bad opcode
00000000000fb647	callq	*%rdx
00000000000fb649	.byte 0xfe #bad opcode
00000000000fb64a	.byte 0xff #bad opcode
00000000000fb64b	.byte 0xff #bad opcode
00000000000fb64c	outl	%eax, %dx
00000000000fb64d	.byte 0xfe #bad opcode
00000000000fb64e	.byte 0xff #bad opcode
00000000000fb64f	callq	*%rdx
00000000000fb651	.byte 0xfe #bad opcode
00000000000fb652	.byte 0xff #bad opcode
00000000000fb653	.byte 0xff #bad opcode
00000000000fb654	outl	%eax, %dx
00000000000fb655	.byte 0xfe #bad opcode
00000000000fb656	.byte 0xff #bad opcode
00000000000fb657	callq	*%rdx
00000000000fb659	.byte 0xfe #bad opcode
00000000000fb65a	.byte 0xff #bad opcode
00000000000fb65b	.byte 0xff #bad opcode
00000000000fb65c	outl	%eax, %dx
00000000000fb65d	.byte 0xfe #bad opcode
00000000000fb65e	.byte 0xff #bad opcode
00000000000fb65f	jmpq	*%rsi
00000000000fb661	.byte 0xfe #bad opcode
00000000000fb662	.byte 0xff #bad opcode
00000000000fb663	callq	*%rdx
00000000000fb665	.byte 0xfe #bad opcode
00000000000fb666	.byte 0xff #bad opcode
00000000000fb667	callq	*%rdx
00000000000fb669	.byte 0xfe #bad opcode
00000000000fb66a	.byte 0xff #bad opcode
00000000000fb66b	callq	*%rdx
00000000000fb66d	.byte 0xfe #bad opcode
00000000000fb66e	.byte 0xff #bad opcode
00000000000fb66f	callq	*%rdx
00000000000fb671	.byte 0xfe #bad opcode
00000000000fb672	.byte 0xff #bad opcode
00000000000fb673	callq	*%rdx
00000000000fb675	.byte 0xfe #bad opcode
00000000000fb676	.byte 0xff #bad opcode
00000000000fb677	callq	*%rdx
00000000000fb679	.byte 0xfe #bad opcode
00000000000fb67a	.byte 0xff #bad opcode
00000000000fb67b	jmpq	*%rsi
00000000000fb67d	.byte 0xfe #bad opcode
00000000000fb67e	.byte 0xff #bad opcode
00000000000fb67f	.byte 0xff #bad opcode
00000000000fb680	outl	%eax, %dx
00000000000fb681	.byte 0xfe #bad opcode
00000000000fb682	.byte 0xff #bad opcode
00000000000fb683	callq	*%rdx
00000000000fb685	.byte 0xfe #bad opcode
00000000000fb686	.byte 0xff #bad opcode
00000000000fb687	callq	*%rdx
00000000000fb689	.byte 0xfe #bad opcode
00000000000fb68a	.byte 0xff #bad opcode
00000000000fb68b	decl	(%rdi)
00000000000fb68d	.byte 0x1f #bad opcode
00000000000fb68e	addb	%dl, 0x48(%rbp)
00000000000fb692	movl	%esp, %ebp
00000000000fb694	pushq	%r15
00000000000fb696	pushq	%r14
00000000000fb698	pushq	%rbx
00000000000fb699	pushq	%rax
00000000000fb69a	movl	%edx, %ebx
00000000000fb69c	movl	%esi, %r14d
00000000000fb69f	movq	%rdi, %r15
00000000000fb6a2	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb6a7	movb	$0x1, 0x2e9(%r15)
00000000000fb6af	movl	%r14d, 0x420(%r15)
00000000000fb6b6	movl	%ebx, 0x428(%r15)
00000000000fb6bd	movq	%r15, %rdi
00000000000fb6c0	addq	$0x8, %rsp
00000000000fb6c4	popq	%rbx
00000000000fb6c5	popq	%r14
00000000000fb6c7	popq	%r15
00000000000fb6c9	popq	%rbp
00000000000fb6ca	jmp	__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv ## HGColorGamma::SetYCbCrBiasAndScale()
00000000000fb6cf	nop
