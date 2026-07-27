__ZN14OZImageElement8parseEndER22PCSerializerReadStream:
00000000005f8640	pushq	%rbp
00000000005f8641	movq	%rsp, %rbp
00000000005f8644	pushq	%r15
00000000005f8646	pushq	%r14
00000000005f8648	pushq	%r12
00000000005f864a	pushq	%rbx
00000000005f864b	movq	%rsi, %r14
00000000005f864e	movq	%rdi, %rbx
00000000005f8651	callq	__ZN9OZElement8parseEndER22PCSerializerReadStream ## OZElement::parseEnd(PCSerializerReadStream&)
00000000005f8656	leaq	0x52c0(%rbx), %rdi
00000000005f865d	movl	$0x20000, %esi                  ## imm = 0x20000
00000000005f8662	movl	$0x1, %edx
00000000005f8667	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000005f866c	leaq	0x5358(%rbx), %rdi
00000000005f8673	movl	$0x20000, %esi                  ## imm = 0x20000
00000000005f8678	movl	$0x1, %edx
00000000005f867d	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000005f8682	leaq	0x4aa0(%rbx), %r15
00000000005f8689	movq	%r15, %rdi
00000000005f868c	callq	__ZNK20OZChanObjectManipRef11getObjectIDEv ## OZChanObjectManipRef::getObjectID() const
00000000005f8691	testl	%eax, %eax
00000000005f8693	je	0x5f86dd
00000000005f8695	leaq	0x49d0(%rbx), %r12
00000000005f869c	movq	%r12, %rdi
00000000005f869f	callq	__ZNK20OZChanObjectManipRef11getObjectIDEv ## OZChanObjectManipRef::getObjectID() const
00000000005f86a4	testl	%eax, %eax
00000000005f86a6	jne	0x5f86dd
00000000005f86a8	movq	%r12, %rdi
00000000005f86ab	movq	%r15, %rsi
00000000005f86ae	callq	__ZN25OZChanObjectRefWithPicker6assignEPK13OZChannelBase ## OZChanObjectRefWithPicker::assign(OZChannelBase const*)
00000000005f86b3	movl	$0xa, %esi
00000000005f86b8	movq	%r12, %rdi
00000000005f86bb	xorl	%edx, %edx
00000000005f86bd	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000005f86c2	movq	%r15, %rdi
00000000005f86c5	xorl	%esi, %esi
00000000005f86c7	xorl	%edx, %edx
00000000005f86c9	callq	__ZN20OZChanObjectManipRef11setObjectIDEjb ## OZChanObjectManipRef::setObjectID(unsigned int, bool)
00000000005f86ce	movl	$0xa, %esi
00000000005f86d3	movq	%r15, %rdi
00000000005f86d6	xorl	%edx, %edx
00000000005f86d8	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000005f86dd	movb	$0x0, 0x7461(%rbx)
00000000005f86e4	cmpl	$0x5, 0x68(%r14)
00000000005f86e9	jne	0x5f870f
00000000005f86eb	cmpl	$0x7, 0x6c(%r14)
00000000005f86f0	jb	0x5f870f
00000000005f86f2	leaq	0x7358(%rbx), %rdi
00000000005f86f9	movq	0x22be10(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000005f8700	movsd	0x10ccd8(%rip), %xmm0
00000000005f8708	xorl	%edx, %edx
00000000005f870a	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000005f870f	leaq	0x7358(%rbx), %r14
00000000005f8716	movq	0x22bdf3(%rip), %r15            ## literal pool symbol address: _kCMTimeZero
00000000005f871d	xorps	%xmm0, %xmm0
00000000005f8720	movq	%r14, %rdi
00000000005f8723	movq	%r15, %rsi
00000000005f8726	xorl	%edx, %edx
00000000005f8728	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000005f872d	xorps	%xmm0, %xmm0
00000000005f8730	movq	%r14, %rdi
00000000005f8733	movq	%r15, %rsi
00000000005f8736	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000005f873b	testl	%eax, %eax
00000000005f873d	setne	0x73f0(%rbx)
00000000005f8744	movb	$0x1, %al
00000000005f8746	popq	%rbx
00000000005f8747	popq	%r12
00000000005f8749	popq	%r14
00000000005f874b	popq	%r15
00000000005f874d	popq	%rbp
00000000005f874e	retq
00000000005f874f	nop
