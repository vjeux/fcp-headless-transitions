__ZN21OZChannelColorNoAlpha27setColorSpaceIDNoConversionEN17PCColorSpaceCache2IDEb:
0000000000056b4e	pushq	%rbp
0000000000056b4f	movq	%rsp, %rbp
0000000000056b52	pushq	%r15
0000000000056b54	pushq	%r14
0000000000056b56	pushq	%r12
0000000000056b58	pushq	%rbx
0000000000056b59	subq	$0x10, %rsp
0000000000056b5d	movl	%edx, %r15d
0000000000056b60	movl	%esi, %r14d
0000000000056b63	movq	%rdi, %rbx
0000000000056b66	addq	$0x2e8, %rbx                    ## imm = 0x2E8
0000000000056b6d	movq	0x7394c(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056b74	xorpd	%xmm0, %xmm0
0000000000056b78	movq	%rbx, %rdi
0000000000056b7b	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000056b80	movl	%eax, %edi
0000000000056b82	movl	$0x3, %esi
0000000000056b87	callq	0xacbd6                         ## symbol stub for: __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE
0000000000056b8c	cmpl	%r14d, %eax
0000000000056b8f	je	0x56be6
0000000000056b91	movl	%eax, %r12d
0000000000056b94	movl	%r14d, %edi
0000000000056b97	callq	0xacbca                         ## symbol stub for: __ZN17PCColorSpaceCache17colorSpaceIDToIntENS_2IDE
0000000000056b9c	xorps	%xmm0, %xmm0
0000000000056b9f	cvtsi2sd	%eax, %xmm0
0000000000056ba3	movzbl	%r15b, %edx
0000000000056ba7	movq	0x73912(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056bae	movq	%rbx, %rdi
0000000000056bb1	movsd	%xmm0, -0x28(%rbp)
0000000000056bb6	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
0000000000056bbb	cmpl	$-0x1, %r14d
0000000000056bbf	setne	%al
0000000000056bc2	cmpl	$-0x1, %r12d
0000000000056bc6	setne	%cl
0000000000056bc9	testb	%cl, %al
0000000000056bcb	jne	0x56be6
0000000000056bcd	movq	%rbx, %rdi
0000000000056bd0	movsd	-0x28(%rbp), %xmm0
0000000000056bd5	addq	$0x10, %rsp
0000000000056bd9	popq	%rbx
0000000000056bda	popq	%r12
0000000000056bdc	popq	%r14
0000000000056bde	popq	%r15
0000000000056be0	popq	%rbp
0000000000056be1	jmp	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000056be6	addq	$0x10, %rsp
0000000000056bea	popq	%rbx
0000000000056beb	popq	%r12
0000000000056bed	popq	%r14
0000000000056bef	popq	%r15
0000000000056bf1	popq	%rbp
0000000000056bf2	retq
0000000000056bf3	nop
