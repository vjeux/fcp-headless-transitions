__ZN19OZChannelRotation3DD2Ev:
000000000008150c	pushq	%rbp
000000000008150d	movq	%rsp, %rbp
0000000000081510	pushq	%rbx
0000000000081511	pushq	%rax
0000000000081512	movq	%rdi, %rbx
0000000000081515	leaq	0x5cf14(%rip), %rax
000000000008151c	movq	%rax, (%rdi)
000000000008151f	leaq	__ZTV19OZChannelRotation3D(%rip), %rax ## vtable for OZChannelRotation3D
0000000000081526	movl	$0x350, %edi                    ## imm = 0x350
000000000008152b	addq	%rdi, %rax
000000000008152e	movq	%rax, 0x10(%rbx)
0000000000081532	addq	%rbx, %rdi
0000000000081535	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
000000000008153a	leaq	0x250(%rbx), %rdi
0000000000081541	callq	__ZN13OZChannelEnumD2Ev         ## OZChannelEnum::~OZChannelEnum()
0000000000081546	leaq	0x1b8(%rbx), %rdi
000000000008154d	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000081552	leaq	0x120(%rbx), %rdi
0000000000081559	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000008155e	leaq	0x88(%rbx), %rdi
0000000000081565	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000008156a	movq	%rbx, %rdi
000000000008156d	addq	$0x8, %rsp
0000000000081571	popq	%rbx
0000000000081572	popq	%rbp
0000000000081573	jmp	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
