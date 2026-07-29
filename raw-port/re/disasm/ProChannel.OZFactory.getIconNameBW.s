__ZN9OZFactory13getIconNameBWEv:
00000000000137a4	pushq	%rbp
00000000000137a5	movq	%rsp, %rbp
00000000000137a8	pushq	%r15
00000000000137aa	pushq	%r14
00000000000137ac	pushq	%r12
00000000000137ae	pushq	%rbx
00000000000137af	subq	$0x10, %rsp
00000000000137b3	movq	%rdi, %rbx
00000000000137b6	testq	%rsi, %rsi
00000000000137b9	je	0x137f9
00000000000137bb	movq	%rsi, %r14
00000000000137be	leaq	-0x28(%rbp), %r15
00000000000137c2	movq	(%r14), %rax
00000000000137c5	movq	%r15, %rdi
00000000000137c8	movq	%r14, %rsi
00000000000137cb	callq	*0x90(%rax)
00000000000137d1	movq	%r15, %rdi
00000000000137d4	callq	0xacd9e                         ## symbol stub for: __ZNK8PCString5emptyEv
00000000000137d9	movl	%eax, %r12d
00000000000137dc	movq	%r15, %rdi
00000000000137df	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000137e4	testb	%r12b, %r12b
00000000000137e7	je	0x13803
00000000000137e9	movq	%r14, %rdi
00000000000137ec	callq	__ZNK9OZFactory15getSuperFactoryEv ## OZFactory::getSuperFactory() const
00000000000137f1	movq	%rax, %r14
00000000000137f4	testq	%rax, %rax
00000000000137f7	jne	0x137c2
00000000000137f9	movq	%rbx, %rdi
00000000000137fc	callq	0xacd1a                         ## symbol stub for: __ZN8PCStringC1Ev
0000000000013801	jmp	0x13812
0000000000013803	movq	(%r14), %rax
0000000000013806	movq	%rbx, %rdi
0000000000013809	movq	%r14, %rsi
000000000001380c	callq	*0x90(%rax)
0000000000013812	movq	%rbx, %rax
0000000000013815	addq	$0x10, %rsp
0000000000013819	popq	%rbx
000000000001381a	popq	%r12
000000000001381c	popq	%r14
000000000001381e	popq	%r15
0000000000013820	popq	%rbp
0000000000013821	retq
0000000000013822	movq	%rax, %rbx
0000000000013825	leaq	-0x28(%rbp), %rdi
0000000000013829	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000001382e	movq	%rbx, %rdi
0000000000013831	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
