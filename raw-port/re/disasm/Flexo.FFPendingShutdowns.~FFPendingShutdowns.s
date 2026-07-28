__ZN18FFPendingShutdownsD1Ev:
0000000000d73a60	pushq	%rbp
0000000000d73a61	movq	%rsp, %rbp
0000000000d73a64	pushq	%r14
0000000000d73a66	pushq	%rbx
0000000000d73a67	movq	%rdi, %rbx
0000000000d73a6a	movq	(%rdi), %rdi
0000000000d73a6d	movq	0xe44adc(%rip), %rsi
0000000000d73a74	callq	*0xb79c46(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d73a7a	testq	%rax, %rax
0000000000d73a7d	jne	0xd73a8d
0000000000d73a7f	movq	(%rbx), %rdi
0000000000d73a82	callq	*0xb79c80(%rip)                 ## literal pool symbol address: _objc_release
0000000000d73a88	popq	%rbx
0000000000d73a89	popq	%r14
0000000000d73a8b	popq	%rbp
0000000000d73a8c	retq
0000000000d73a8d	movq	0xb798fc(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAssertionHandler
0000000000d73a94	movq	0xe45d8d(%rip), %rsi
0000000000d73a9b	callq	*0xb79c1f(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d73aa1	movq	%rax, %r14
0000000000d73aa4	movq	0xb79abd(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSString
0000000000d73aab	movq	0xe502be(%rip), %rsi
0000000000d73ab2	leaq	0x8ea7e2(%rip), %rdx            ## literal pool for: "FFPendingShutdowns::~FFPendingShutdowns()"
0000000000d73ab9	callq	*0xb79c01(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d73abf	movq	0xe52d1a(%rip), %rsi
0000000000d73ac6	leaq	0xc3a25b(%rip), %rcx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d73acd	leaq	0xc3ad74(%rip), %r9             ## Objc cfstring ref: @"bad cfstring ref"
0000000000d73ad4	movl	$0x58c, %r8d                    ## imm = 0x58C
0000000000d73ada	movq	%r14, %rdi
0000000000d73add	movq	%rax, %rdx
0000000000d73ae0	xorl	%eax, %eax
0000000000d73ae2	callq	*0xb79bd8(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d73ae8	jmp	0xd73a7f
0000000000d73aea	movq	%rax, %rdi
0000000000d73aed	callq	___clang_call_terminate
0000000000d73af2	nopw	%cs:(%rax,%rax)
