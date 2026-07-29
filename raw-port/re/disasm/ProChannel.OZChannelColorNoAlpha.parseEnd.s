__ZN21OZChannelColorNoAlpha8parseEndER22PCSerializerReadStream:
0000000000056930	pushq	%rbp
0000000000056931	movq	%rsp, %rbp
0000000000056934	pushq	%r15
0000000000056936	pushq	%r14
0000000000056938	pushq	%r13
000000000005693a	pushq	%r12
000000000005693c	pushq	%rbx
000000000005693d	subq	$0x38, %rsp
0000000000056941	movq	%rdi, %rbx
0000000000056944	movq	0x73b75(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
000000000005694b	movq	0x10(%rax), %rcx
000000000005694f	movq	%rcx, -0x50(%rbp)
0000000000056953	movupd	(%rax), %xmm0
0000000000056957	movapd	%xmm0, -0x60(%rbp)
000000000005695c	movl	0x68(%rsi), %eax
000000000005695f	cmpl	$0x2, %eax
0000000000056962	ja	0x56a40
0000000000056968	movq	%rsi, -0x48(%rbp)
000000000005696c	movq	%rbx, %rdi
000000000005696f	callq	__ZNK13OZChannelBase14getChannelRootEv ## OZChannelBase::getChannelRoot() const
0000000000056974	testq	%rax, %rax
0000000000056977	je	0x56996
0000000000056979	movq	%rbx, %rdi
000000000005697c	callq	__ZNK13OZChannelBase14getChannelRootEv ## OZChannelBase::getChannelRoot() const
0000000000056981	movq	(%rax), %rcx
0000000000056984	leaq	-0x60(%rbp), %rdi
0000000000056988	movq	%rax, %rsi
000000000005698b	movl	$0x1, %edx
0000000000056990	callq	*0x358(%rcx)
0000000000056996	leaq	0x88(%rbx), %r12
000000000005699d	leaq	-0x60(%rbp), %r15
00000000000569a1	xorpd	%xmm0, %xmm0
00000000000569a5	movq	%r12, %rdi
00000000000569a8	movq	%r15, %rsi
00000000000569ab	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000569b0	movsd	%xmm0, -0x40(%rbp)
00000000000569b5	leaq	0x120(%rbx), %r13
00000000000569bc	xorpd	%xmm0, %xmm0
00000000000569c0	movq	%r13, %rdi
00000000000569c3	movq	%r15, %rsi
00000000000569c6	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000569cb	movsd	%xmm0, -0x38(%rbp)
00000000000569d0	leaq	0x1b8(%rbx), %r14
00000000000569d7	xorpd	%xmm0, %xmm0
00000000000569db	movq	%r14, %rdi
00000000000569de	movq	%r15, %rsi
00000000000569e1	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000569e6	movsd	%xmm0, -0x30(%rbp)
00000000000569eb	movq	0x88(%rbx), %rax
00000000000569f2	movq	%r12, %rdi
00000000000569f5	movq	%r15, %rsi
00000000000569f8	movsd	-0x40(%rbp), %xmm0
00000000000569fd	xorl	%edx, %edx
00000000000569ff	callq	*0x2c8(%rax)
0000000000056a05	movq	0x120(%rbx), %rax
0000000000056a0c	movq	%r13, %rdi
0000000000056a0f	movq	%r15, %rsi
0000000000056a12	movsd	-0x38(%rbp), %xmm0
0000000000056a17	xorl	%edx, %edx
0000000000056a19	callq	*0x2c8(%rax)
0000000000056a1f	movq	0x1b8(%rbx), %rax
0000000000056a26	movq	%r14, %rdi
0000000000056a29	movq	%r15, %rsi
0000000000056a2c	movsd	-0x30(%rbp), %xmm0
0000000000056a31	xorl	%edx, %edx
0000000000056a33	callq	*0x2c8(%rax)
0000000000056a39	movq	-0x48(%rbp), %rax
0000000000056a3d	movl	0x68(%rax), %eax
0000000000056a40	cmpl	$0x3, %eax
0000000000056a43	ja	0x56a54
0000000000056a45	movq	%rbx, %rdi
0000000000056a48	movl	$0x2, %esi
0000000000056a4d	xorl	%edx, %edx
0000000000056a4f	callq	__ZN21OZChannelColorNoAlpha27setColorSpaceIDNoConversionEN17PCColorSpaceCache2IDEb ## OZChannelColorNoAlpha::setColorSpaceIDNoConversion(PCColorSpaceCache::ID, bool)
0000000000056a54	leaq	0x250(%rbx), %rdi
0000000000056a5b	movq	0x73a5e(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056a62	xorpd	%xmm0, %xmm0
0000000000056a66	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056a6b	xorpd	%xmm1, %xmm1
0000000000056a6f	ucomisd	%xmm1, %xmm0
0000000000056a73	jne	0x56a77
0000000000056a75	jnp	0x56a83
0000000000056a77	ucomisd	0x58aa9(%rip), %xmm0
0000000000056a7f	jne	0x56a92
0000000000056a81	jp	0x56a92
0000000000056a83	movq	%rbx, %rdi
0000000000056a86	movl	$0x3, %esi
0000000000056a8b	xorl	%edx, %edx
0000000000056a8d	callq	__ZN21OZChannelColorNoAlpha27setColorSpaceIDNoConversionEN17PCColorSpaceCache2IDEb ## OZChannelColorNoAlpha::setColorSpaceIDNoConversion(PCColorSpaceCache::ID, bool)
0000000000056a92	leaq	0x2e8(%rbx), %rdi
0000000000056a99	movq	0x73a20(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056aa0	xorpd	%xmm0, %xmm0
0000000000056aa4	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000056aa9	movl	%eax, %edi
0000000000056aab	movl	$0x3, %esi
0000000000056ab0	callq	0xacbd6                         ## symbol stub for: __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE
0000000000056ab5	testl	%eax, %eax
0000000000056ab7	jne	0x56ac8
0000000000056ab9	movq	%rbx, %rdi
0000000000056abc	movl	$0x3, %esi
0000000000056ac1	xorl	%edx, %edx
0000000000056ac3	callq	__ZN21OZChannelColorNoAlpha27setColorSpaceIDNoConversionEN17PCColorSpaceCache2IDEb ## OZChannelColorNoAlpha::setColorSpaceIDNoConversion(PCColorSpaceCache::ID, bool)
0000000000056ac8	leaq	0x88(%rbx), %r14
0000000000056acf	movsd	0x5a299(%rip), %xmm0
0000000000056ad7	movq	%r14, %rdi
0000000000056ada	callq	__ZN9OZChannel6setMinEd         ## OZChannel::setMin(double)
0000000000056adf	movsd	0x5a291(%rip), %xmm0
0000000000056ae7	movq	%r14, %rdi
0000000000056aea	callq	__ZN9OZChannel6setMaxEd         ## OZChannel::setMax(double)
0000000000056aef	leaq	0x120(%rbx), %r14
0000000000056af6	movq	%r14, %rdi
0000000000056af9	movsd	0x5a26f(%rip), %xmm0
0000000000056b01	callq	__ZN9OZChannel6setMinEd         ## OZChannel::setMin(double)
0000000000056b06	movq	%r14, %rdi
0000000000056b09	movsd	0x5a267(%rip), %xmm0
0000000000056b11	callq	__ZN9OZChannel6setMaxEd         ## OZChannel::setMax(double)
0000000000056b16	addq	$0x1b8, %rbx                    ## imm = 0x1B8
0000000000056b1d	movq	%rbx, %rdi
0000000000056b20	movsd	0x5a248(%rip), %xmm0
0000000000056b28	callq	__ZN9OZChannel6setMinEd         ## OZChannel::setMin(double)
0000000000056b2d	movq	%rbx, %rdi
0000000000056b30	movsd	0x5a240(%rip), %xmm0
0000000000056b38	callq	__ZN9OZChannel6setMaxEd         ## OZChannel::setMax(double)
0000000000056b3d	movb	$0x1, %al
0000000000056b3f	addq	$0x38, %rsp
0000000000056b43	popq	%rbx
0000000000056b44	popq	%r12
0000000000056b46	popq	%r13
0000000000056b48	popq	%r14
0000000000056b4a	popq	%r15
0000000000056b4c	popq	%rbp
0000000000056b4d	retq
