__ZN9OZElement10parseBeginER22PCSerializerReadStream:
000000000009e580	pushq	%rbp
000000000009e581	movq	%rsp, %rbp
000000000009e584	pushq	%r15
000000000009e586	pushq	%r14
000000000009e588	pushq	%rbx
000000000009e589	pushq	%rax
000000000009e58a	movq	%rsi, %rbx
000000000009e58d	movq	%rdi, %r14
000000000009e590	movl	$0x0, 0x47d0(%rdi)
000000000009e59a	leaq	0x2d40(%rdi), %r15
000000000009e5a1	movq	%r15, %rdi
000000000009e5a4	callq	0x6dfa92                        ## symbol stub for: __ZNK9OZChannel15getDefaultValueEv
000000000009e5a9	movq	0x785f60(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
000000000009e5b0	movq	%r15, %rdi
000000000009e5b3	xorl	%edx, %edx
000000000009e5b5	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
000000000009e5ba	movq	%r14, %rdi
000000000009e5bd	movq	%rbx, %rsi
000000000009e5c0	callq	__ZN15OZTransformNode10parseBeginER22PCSerializerReadStream ## OZTransformNode::parseBegin(PCSerializerReadStream&)
000000000009e5c5	leaq	__ZL14OZElementScope(%rip), %rsi ## OZElementScope
000000000009e5cc	movq	%rbx, %rdi
000000000009e5cf	callq	0x6de79c                        ## symbol stub for: __ZN22PCSerializerReadStream9pushScopeEP7PCScope
000000000009e5d4	movq	0x68(%rbx), %rax
000000000009e5d8	movq	%rax, 0x4928(%r14)
000000000009e5df	movb	$0x1, %al
000000000009e5e1	addq	$0x8, %rsp
000000000009e5e5	popq	%rbx
000000000009e5e6	popq	%r14
000000000009e5e8	popq	%r15
000000000009e5ea	popq	%rbp
000000000009e5eb	retq
000000000009e5ec	nopl	(%rax)
