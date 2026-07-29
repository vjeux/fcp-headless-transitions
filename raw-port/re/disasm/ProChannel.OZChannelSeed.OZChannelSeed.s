__ZN13OZChannelSeedC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo:
000000000000fc1e	pushq	%rbp
000000000000fc1f	movq	%rsp, %rbp
000000000000fc22	pushq	%r15
000000000000fc24	pushq	%r14
000000000000fc26	pushq	%rbx
000000000000fc27	subq	$0x18, %rsp
000000000000fc2b	movq	%r9, %r15
000000000000fc2e	movq	%r8, %r14
000000000000fc31	movl	%ecx, %r8d
000000000000fc34	movq	%rdi, %rbx
000000000000fc37	movq	%r9, 0x8(%rsp)
000000000000fc3c	movq	%r14, (%rsp)
000000000000fc40	xorl	%ecx, %ecx
000000000000fc42	xorl	%r9d, %r9d
000000000000fc45	callq	__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
000000000000fc4a	leaq	__ZTV13OZChannelSeed(%rip), %rax ## vtable for OZChannelSeed
000000000000fc51	leaq	0x10(%rax), %rcx
000000000000fc55	movq	%rcx, (%rbx)
000000000000fc58	addq	$0x370, %rax                    ## imm = 0x370
000000000000fc5e	movq	%rax, 0x10(%rbx)
000000000000fc62	callq	__ZN13OZChannelSeed23createOZChannelSeedInfoEv ## OZChannelSeed::createOZChannelSeedInfo()
000000000000fc67	testq	%r15, %r15
000000000000fc6a	je	0xfc75
000000000000fc6c	movq	0x88(%rbx), %rax
000000000000fc73	jmp	0xfc86
000000000000fc75	leaq	__ZN13OZChannelSeed18_OZChannelSeedInfoE(%rip), %rax ## OZChannelSeed::_OZChannelSeedInfo
000000000000fc7c	movq	(%rax), %rax
000000000000fc7f	movq	%rax, 0x88(%rbx)
000000000000fc86	movq	%rax, 0x80(%rbx)
000000000000fc8d	callq	__ZN13OZChannelSeed23createOZChannelSeedImplEv ## OZChannelSeed::createOZChannelSeedImpl()
000000000000fc92	testq	%r14, %r14
000000000000fc95	je	0xfc9d
000000000000fc97	movq	0x78(%rbx), %rax
000000000000fc9b	jmp	0xfcab
000000000000fc9d	leaq	__ZN13OZChannelSeed18_OZChannelSeedImplE(%rip), %rax ## OZChannelSeed::_OZChannelSeedImpl
000000000000fca4	movq	(%rax), %rax
000000000000fca7	movq	%rax, 0x78(%rbx)
000000000000fcab	movq	%rax, 0x70(%rbx)
000000000000fcaf	addq	$0x18, %rsp
000000000000fcb3	popq	%rbx
000000000000fcb4	popq	%r14
000000000000fcb6	popq	%r15
000000000000fcb8	popq	%rbp
000000000000fcb9	retq
000000000000fcba	movq	%rax, %r14
000000000000fcbd	movq	%rbx, %rdi
000000000000fcc0	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000000fcc5	movq	%r14, %rdi
000000000000fcc8	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000000fccd	nop
