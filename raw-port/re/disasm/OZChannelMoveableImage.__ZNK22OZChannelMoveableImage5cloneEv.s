__ZNK22OZChannelMoveableImage5cloneEv:
0000000000339af0	pushq	%rbp
0000000000339af1	movq	%rsp, %rbp
0000000000339af4	pushq	%r14
0000000000339af6	pushq	%rbx
0000000000339af7	movq	%rdi, %r14
0000000000339afa	movl	$0xb0, %edi
0000000000339aff	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000339b04	movq	%rax, %rbx
0000000000339b07	movq	%rax, %rdi
0000000000339b0a	movq	%r14, %rsi
0000000000339b0d	xorl	%edx, %edx
0000000000339b0f	callq	__ZN25OZChanElementOrFootageRefC2ERK18OZChanSceneNodeRefP15OZChannelFolder ## OZChanElementOrFootageRef::OZChanElementOrFootageRef(OZChanSceneNodeRef const&, OZChannelFolder*)
0000000000339b14	leaq	0x5160d5(%rip), %rax
0000000000339b1b	movq	%rax, (%rbx)
0000000000339b1e	leaq	0x51644b(%rip), %rax
0000000000339b25	movq	%rax, 0x10(%rbx)
0000000000339b29	movq	0xa0(%r14), %rdi
0000000000339b30	testq	%rdi, %rdi
0000000000339b33	je	0x339b42
0000000000339b35	movq	(%rdi), %rax
0000000000339b38	callq	*0xf8(%rax)
0000000000339b3e	movb	$0x1, %cl
0000000000339b40	jmp	0x339b46
0000000000339b42	xorl	%eax, %eax
0000000000339b44	xorl	%ecx, %ecx
0000000000339b46	movq	%rax, 0xa0(%rbx)
0000000000339b4d	movb	%cl, 0xa8(%rbx)
0000000000339b53	movq	%rbx, %rax
0000000000339b56	popq	%rbx
0000000000339b57	popq	%r14
0000000000339b59	popq	%rbp
0000000000339b5a	retq
0000000000339b5b	movq	%rax, %r14
0000000000339b5e	movq	%rbx, %rdi
0000000000339b61	callq	__ZN25OZChanElementOrFootageRefD2Ev ## OZChanElementOrFootageRef::~OZChanElementOrFootageRef()
0000000000339b66	movq	%rbx, %rdi
0000000000339b69	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000339b6e	movq	%r14, %rdi
0000000000339b71	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000339b76	movq	%rax, %r14
0000000000339b79	movq	%rbx, %rdi
0000000000339b7c	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000339b81	movq	%r14, %rdi
0000000000339b84	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000339b89	nopl	(%rax)
