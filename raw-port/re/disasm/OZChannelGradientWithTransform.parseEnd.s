__ZN30OZChannelGradientWithTransform8parseEndER22PCSerializerReadStream:
0000000000499420	pushq	%rbp
0000000000499421	movq	%rsp, %rbp
0000000000499424	pushq	%r15
0000000000499426	pushq	%r14
0000000000499428	pushq	%r12
000000000049942a	pushq	%rbx
000000000049942b	movq	%rdi, %rbx
000000000049942e	callq	0x6de244                        ## symbol stub for: __ZN17OZChannelGradient8parseEndER22PCSerializerReadStream
0000000000499433	testb	$0x2, 0x9e0(%rbx)
000000000049943a	jne	0x499493
000000000049943c	movl	%eax, %r12d
000000000049943f	leaq	0x9a8(%rbx), %r14
0000000000499446	movq	0x38b0c3(%rip), %r15            ## literal pool symbol address: _kCMTimeZero
000000000049944d	xorps	%xmm0, %xmm0
0000000000499450	movq	%r14, %rdi
0000000000499453	movq	%r15, %rsi
0000000000499456	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000049945b	addq	$0xaa8, %rbx                    ## imm = 0xAA8
0000000000499462	cmpl	$0x2, %eax
0000000000499465	je	0x49946c
0000000000499467	xorps	%xmm0, %xmm0
000000000049946a	jmp	0x499474
000000000049946c	movsd	0x26bf6c(%rip), %xmm0
0000000000499474	movq	%rbx, %rdi
0000000000499477	movq	%r15, %rsi
000000000049947a	xorl	%edx, %edx
000000000049947c	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
0000000000499481	movl	$0x2, %esi
0000000000499486	movq	%r14, %rdi
0000000000499489	xorl	%edx, %edx
000000000049948b	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
0000000000499490	movl	%r12d, %eax
0000000000499493	popq	%rbx
0000000000499494	popq	%r12
0000000000499496	popq	%r14
0000000000499498	popq	%r15
000000000049949a	popq	%rbp
000000000049949b	retq
000000000049949c	nopl	(%rax)
