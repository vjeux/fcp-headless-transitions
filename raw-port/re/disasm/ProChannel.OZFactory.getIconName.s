__ZN9OZFactory11getIconNameEv:
0000000000013712	pushq	%rbp
0000000000013713	movq	%rsp, %rbp
0000000000013716	pushq	%r15
0000000000013718	pushq	%r14
000000000001371a	pushq	%r12
000000000001371c	pushq	%rbx
000000000001371d	subq	$0x10, %rsp
0000000000013721	movq	%rdi, %rbx
0000000000013724	testq	%rsi, %rsi
0000000000013727	je	0x13767
0000000000013729	movq	%rsi, %r14
000000000001372c	leaq	-0x28(%rbp), %r15
0000000000013730	movq	(%r14), %rax
0000000000013733	movq	%r15, %rdi
0000000000013736	movq	%r14, %rsi
0000000000013739	callq	*0x88(%rax)
000000000001373f	movq	%r15, %rdi
0000000000013742	callq	0xacd9e                         ## symbol stub for: __ZNK8PCString5emptyEv
0000000000013747	movl	%eax, %r12d
000000000001374a	movq	%r15, %rdi
000000000001374d	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000013752	testb	%r12b, %r12b
0000000000013755	je	0x13771
0000000000013757	movq	%r14, %rdi
000000000001375a	callq	__ZNK9OZFactory15getSuperFactoryEv ## OZFactory::getSuperFactory() const
000000000001375f	movq	%rax, %r14
0000000000013762	testq	%rax, %rax
0000000000013765	jne	0x13730
0000000000013767	movq	%rbx, %rdi
000000000001376a	callq	0xacd1a                         ## symbol stub for: __ZN8PCStringC1Ev
000000000001376f	jmp	0x13780
0000000000013771	movq	(%r14), %rax
0000000000013774	movq	%rbx, %rdi
0000000000013777	movq	%r14, %rsi
000000000001377a	callq	*0x88(%rax)
0000000000013780	movq	%rbx, %rax
0000000000013783	addq	$0x10, %rsp
0000000000013787	popq	%rbx
0000000000013788	popq	%r12
000000000001378a	popq	%r14
000000000001378c	popq	%r15
000000000001378e	popq	%rbp
000000000001378f	retq
0000000000013790	movq	%rax, %rbx
0000000000013793	leaq	-0x28(%rbp), %rdi
0000000000013797	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000001379c	movq	%rbx, %rdi
000000000001379f	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
