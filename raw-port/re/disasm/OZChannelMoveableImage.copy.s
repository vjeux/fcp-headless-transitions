__ZN22OZChannelMoveableImage4copyEPK13OZChannelBaseb:
0000000000339a90	pushq	%rbp
0000000000339a91	movq	%rsp, %rbp
0000000000339a94	pushq	%r15
0000000000339a96	pushq	%r14
0000000000339a98	pushq	%rbx
0000000000339a99	pushq	%rax
0000000000339a9a	movl	%edx, %ebx
0000000000339a9c	movq	%rsi, %r14
0000000000339a9f	movq	%rdi, %r15
0000000000339aa2	callq	__ZN18OZChanSceneNodeRef4copyEPK13OZChannelBaseb ## OZChanSceneNodeRef::copy(OZChannelBase const*, bool)
0000000000339aa7	movq	0x4e8c82(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000339aae	leaq	__ZTI22OZChannelMoveableImage(%rip), %rdx ## typeinfo for OZChannelMoveableImage
0000000000339ab5	movq	%r14, %rdi
0000000000339ab8	xorl	%ecx, %ecx
0000000000339aba	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000339abf	movq	0xa0(%r15), %rdi
0000000000339ac6	movq	0xa0(%rax), %rsi
0000000000339acd	movq	(%rdi), %rax
0000000000339ad0	movq	0xe8(%rax), %rax
0000000000339ad7	movl	%ebx, %edx
0000000000339ad9	addq	$0x8, %rsp
0000000000339add	popq	%rbx
0000000000339ade	popq	%r14
0000000000339ae0	popq	%r15
0000000000339ae2	popq	%rbp
0000000000339ae3	jmpq	*%rax
0000000000339ae5	nopw	%cs:(%rax,%rax)
