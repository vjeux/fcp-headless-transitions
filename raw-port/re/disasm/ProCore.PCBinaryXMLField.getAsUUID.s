__ZNK16PCBinaryXMLField9getAsUUIDEv:
0000000000066a32	pushq	%rbp
0000000000066a33	movq	%rsp, %rbp
0000000000066a36	pushq	%r14
0000000000066a38	pushq	%rbx
0000000000066a39	subq	$0x10, %rsp
0000000000066a3d	movq	%rdi, %rbx
0000000000066a40	movl	(%rdi), %eax
0000000000066a42	cmpl	$0x6, %eax
0000000000066a45	je	0x66a74
0000000000066a47	cmpl	$0x5, %eax
0000000000066a4a	jne	0x66a8a
0000000000066a4c	addq	$0x40, %rbx
0000000000066a50	movq	%rbx, %rdi
0000000000066a53	callq	__ZNK8PCString10createCStrEv    ## PCString::createCStr() const
0000000000066a58	movq	%rax, %rbx
0000000000066a5b	leaq	-0x18(%rbp), %rdi
0000000000066a5f	movq	%rax, (%rdi)
0000000000066a62	callq	__ZN15PCStreamElement7atoUUIDEPPKc ## PCStreamElement::atoUUID(char const**)
0000000000066a67	movq	%rax, %r14
0000000000066a6a	movq	%rbx, %rdi
0000000000066a6d	callq	0xde89a                         ## symbol stub for: _free
0000000000066a72	jmp	0x66a8d
0000000000066a74	movl	$0x10, %edi
0000000000066a79	callq	0xde6cc                         ## symbol stub for: __Znwm
0000000000066a7e	movq	%rax, %r14
0000000000066a81	movups	0x48(%rbx), %xmm0
0000000000066a85	movups	%xmm0, (%rax)
0000000000066a88	jmp	0x66a8d
0000000000066a8a	xorl	%r14d, %r14d
0000000000066a8d	movq	%r14, %rax
0000000000066a90	addq	$0x10, %rsp
0000000000066a94	popq	%rbx
0000000000066a95	popq	%r14
0000000000066a97	popq	%rbp
0000000000066a98	retq
0000000000066a99	nop
