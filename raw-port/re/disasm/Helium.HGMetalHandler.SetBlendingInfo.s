__ZN14HGMetalHandler15SetBlendingInfoERK14HGBlendingInfo:
000000000015db50	pushq	%rbp
000000000015db51	movq	%rsp, %rbp
000000000015db54	pushq	%r15
000000000015db56	pushq	%r14
000000000015db58	pushq	%rbx
000000000015db59	pushq	%rax
000000000015db5a	movq	%rsi, %r15
000000000015db5d	movq	%rdi, %rbx
000000000015db60	leaq	0x5d0(%rdi), %r14
000000000015db67	movq	%rsi, %rdi
000000000015db6a	movq	%r14, %rsi
000000000015db6d	callq	__ZNK14HGBlendingInfoeqERKS_    ## HGBlendingInfo::operator==(HGBlendingInfo const&) const
000000000015db72	testb	%al, %al
000000000015db74	jne	0x15db8f
000000000015db76	movups	(%r15), %xmm0
000000000015db7a	movups	0x10(%r15), %xmm1
000000000015db7f	movups	%xmm1, 0x10(%r14)
000000000015db84	movups	%xmm0, (%r14)
000000000015db88	movb	$0x1, 0x708(%rbx)
000000000015db8f	addq	$0x8, %rsp
000000000015db93	popq	%rbx
000000000015db94	popq	%r14
000000000015db96	popq	%r15
000000000015db98	popq	%rbp
000000000015db99	retq
000000000015db9a	nopw	(%rax,%rax)
