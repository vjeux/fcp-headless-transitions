__ZN14OZChannelFrameC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo:
0000000000010c1a	pushq	%rbp
0000000000010c1b	movq	%rsp, %rbp
0000000000010c1e	pushq	%r15
0000000000010c20	pushq	%r14
0000000000010c22	pushq	%rbx
0000000000010c23	subq	$0x18, %rsp
0000000000010c27	movq	%r9, %r15
0000000000010c2a	movq	%r8, %r14
0000000000010c2d	movl	%ecx, %r8d
0000000000010c30	movq	%rdi, %rbx
0000000000010c33	movq	%r9, 0x8(%rsp)
0000000000010c38	movq	%r14, (%rsp)
0000000000010c3c	xorl	%ecx, %ecx
0000000000010c3e	xorl	%r9d, %r9d
0000000000010c41	callq	__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000010c46	leaq	__ZTV14OZChannelFrame(%rip), %rax ## vtable for OZChannelFrame
0000000000010c4d	leaq	0x10(%rax), %rcx
0000000000010c51	movq	%rcx, (%rbx)
0000000000010c54	addq	$0x370, %rax                    ## imm = 0x370
0000000000010c5a	movq	%rax, 0x10(%rbx)
0000000000010c5e	callq	__ZN14OZChannelFrame24createOZChannelFrameInfoEv ## OZChannelFrame::createOZChannelFrameInfo()
0000000000010c63	testq	%r15, %r15
0000000000010c66	je	0x10c71
0000000000010c68	movq	0x88(%rbx), %rax
0000000000010c6f	jmp	0x10c82
0000000000010c71	leaq	__ZN14OZChannelFrame19_OZChannelFrameInfoE(%rip), %rax ## OZChannelFrame::_OZChannelFrameInfo
0000000000010c78	movq	(%rax), %rax
0000000000010c7b	movq	%rax, 0x88(%rbx)
0000000000010c82	movq	%rax, 0x80(%rbx)
0000000000010c89	callq	__ZN14OZChannelFrame24createOZChannelFrameImplEv ## OZChannelFrame::createOZChannelFrameImpl()
0000000000010c8e	testq	%r14, %r14
0000000000010c91	je	0x10c99
0000000000010c93	movq	0x78(%rbx), %rax
0000000000010c97	jmp	0x10ca7
0000000000010c99	leaq	__ZN14OZChannelFrame19_OZChannelFrameImplE(%rip), %rax ## OZChannelFrame::_OZChannelFrameImpl
0000000000010ca0	movq	(%rax), %rax
0000000000010ca3	movq	%rax, 0x78(%rbx)
0000000000010ca7	movq	%rax, 0x70(%rbx)
0000000000010cab	addq	$0x18, %rsp
0000000000010caf	popq	%rbx
0000000000010cb0	popq	%r14
0000000000010cb2	popq	%r15
0000000000010cb4	popq	%rbp
0000000000010cb5	retq
0000000000010cb6	movq	%rax, %r14
0000000000010cb9	movq	%rbx, %rdi
0000000000010cbc	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000010cc1	movq	%r14, %rdi
0000000000010cc4	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000010cc9	nop
