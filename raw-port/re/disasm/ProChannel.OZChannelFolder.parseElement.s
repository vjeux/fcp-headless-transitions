__ZN15OZChannelFolder12parseElementER22PCSerializerReadStreamR15PCStreamElement:
00000000000666b8	pushq	%rbp
00000000000666b9	movq	%rsp, %rbp
00000000000666bc	pushq	%r15
00000000000666be	pushq	%r14
00000000000666c0	pushq	%r13
00000000000666c2	pushq	%r12
00000000000666c4	pushq	%rbx
00000000000666c5	subq	$0x48, %rsp
00000000000666c9	movq	%rdx, %r14
00000000000666cc	movq	%rsi, %rbx
00000000000666cf	movq	%rdi, %r15
00000000000666d2	callq	__ZN13OZChannelBase12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZChannelBase::parseElement(PCSerializerReadStream&, PCStreamElement&)
00000000000666d7	movl	0x8(%r14), %eax
00000000000666db	cmpl	$0x6f, %eax
00000000000666de	je	0x667df
00000000000666e4	cmpl	$0x6e, %eax
00000000000666e7	jne	0x669e1
00000000000666ed	leaq	-0x2c(%rbp), %rcx
00000000000666f1	movq	%rbx, %rdi
00000000000666f4	movq	%r14, %rsi
00000000000666f7	movl	$0x6f, %edx
00000000000666fc	callq	0xacd50                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
0000000000066701	movq	0x70(%r15), %rcx
0000000000066705	testq	%rcx, %rcx
0000000000066708	je	0x66730
000000000006670a	movq	(%rcx), %rax
000000000006670d	movq	0x8(%rcx), %rcx
0000000000066711	cmpq	%rcx, %rax
0000000000066714	je	0x66730
0000000000066716	movl	-0x2c(%rbp), %edx
0000000000066719	movq	(%rax), %r12
000000000006671c	cmpl	%edx, 0x18(%r12)
0000000000066721	je	0x66830
0000000000066727	addq	$0x8, %rax
000000000006672b	cmpq	%rcx, %rax
000000000006672e	jne	0x66719
0000000000066730	leaq	-0x64(%rbp), %r12
0000000000066734	movl	$0x0, (%r12)
000000000006673c	movq	%rbx, %rdi
000000000006673f	movq	%r14, %rsi
0000000000066742	movl	$0x71, %edx
0000000000066747	movq	%r12, %rcx
000000000006674a	callq	0xacd50                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000006674f	callq	__ZN11OZFactories11getInstanceEv ## OZFactories::getInstance()
0000000000066754	movl	(%r12), %esi
0000000000066758	movq	%rax, %rdi
000000000006675b	callq	__ZN11OZFactories13lookupFactoryEj ## OZFactories::lookupFactory(unsigned int)
0000000000066760	testq	%rax, %rax
0000000000066763	je	0x66957
0000000000066769	leaq	__ZTI9OZFactory(%rip), %rsi     ## typeinfo for OZFactory
0000000000066770	movq	0x640d1(%rip), %rdx             ## literal pool symbol address: __ZTI16OZChannelFactory
0000000000066777	movq	%rax, %rdi
000000000006677a	xorl	%ecx, %ecx
000000000006677c	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
0000000000066781	testq	%rax, %rax
0000000000066784	je	0x66957
000000000006678a	movq	%rax, %r12
000000000006678d	leaq	-0x40(%rbp), %r13
0000000000066791	movq	%r13, %rdi
0000000000066794	callq	0xacd1a                         ## symbol stub for: __ZN8PCStringC1Ev
0000000000066799	movq	%rbx, %rdi
000000000006679c	movq	%r14, %rsi
000000000006679f	movl	$0x6e, %edx
00000000000667a4	movq	%r13, %rcx
00000000000667a7	callq	0xacd4a                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
00000000000667ac	movl	-0x2c(%rbp), %edx
00000000000667af	movq	(%r12), %rax
00000000000667b3	leaq	-0x40(%rbp), %rsi
00000000000667b7	movq	%r12, %rdi
00000000000667ba	callq	*0x10(%rax)
00000000000667bd	testq	%rax, %rax
00000000000667c0	je	0x66810
00000000000667c2	movq	0x64077(%rip), %rsi             ## literal pool symbol address: __ZTI13OZFactoryBase
00000000000667c9	leaq	__ZTI13OZChannelBase(%rip), %rdx ## typeinfo for OZChannelBase
00000000000667d0	movq	%rax, %rdi
00000000000667d3	xorl	%ecx, %ecx
00000000000667d5	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
00000000000667da	movq	%rax, %r12
00000000000667dd	jmp	0x66813
00000000000667df	movq	(%r14), %rax
00000000000667e2	leaq	-0x54(%rbp), %rsi
00000000000667e6	movq	%r14, %rdi
00000000000667e9	callq	*0x20(%rax)
00000000000667ec	testb	%al, %al
00000000000667ee	je	0x669e1
00000000000667f4	movl	$0x2220000, %eax                ## imm = 0x2220000
00000000000667f9	andl	0x78(%r15), %eax
00000000000667fd	movl	$0xfdddffff, %ecx               ## imm = 0xFDDDFFFF
0000000000066802	andl	-0x54(%rbp), %ecx
0000000000066805	orl	%eax, %ecx
0000000000066807	movl	%ecx, 0x78(%r15)
000000000006680b	jmp	0x669e1
0000000000066810	xorl	%r12d, %r12d
0000000000066813	movq	%r15, %rdi
0000000000066816	movq	%r12, %rsi
0000000000066819	callq	__ZN15OZChannelFolder9push_backEP13OZChannelBase ## OZChannelFolder::push_back(OZChannelBase*)
000000000006681e	leaq	-0x40(%rbp), %rdi
0000000000066822	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000066827	testq	%r12, %r12
000000000006682a	je	0x66957
0000000000066830	leaq	-0x60(%rbp), %rcx
0000000000066834	movq	%rbx, %rdi
0000000000066837	movq	%r14, %rsi
000000000006683a	movl	$0x70, %edx
000000000006683f	callq	0xacd56                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt64ERK15PCStreamElementjPy
0000000000066844	testb	%al, %al
0000000000066846	je	0x66874
0000000000066848	movabsq	$-0x2080a3899, %rax             ## imm = 0xFFFFFFFDF7F5C767
0000000000066852	andq	-0x60(%rbp), %rax
0000000000066856	movabsq	$0x2080a3898, %rsi              ## imm = 0x2080A3898
0000000000066860	andq	0x38(%r12), %rsi
0000000000066865	orq	%rax, %rsi
0000000000066868	movq	%rsi, -0x60(%rbp)
000000000006686c	movq	%r12, %rdi
000000000006686f	callq	__ZN13OZChannelBase8setFlagsEy  ## OZChannelBase::setFlags(unsigned long long)
0000000000066874	leaq	-0x50(%rbp), %rcx
0000000000066878	movq	%rbx, %rdi
000000000006687b	movq	%r14, %rsi
000000000006687e	movl	$0x73, %edx
0000000000066883	callq	0xacd44                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd
0000000000066888	testb	%al, %al
000000000006688a	je	0x668b6
000000000006688c	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
0000000000066893	leaq	__ZTI9OZChannel(%rip), %rdx     ## typeinfo for OZChannel
000000000006689a	movq	%r12, %rdi
000000000006689d	xorl	%ecx, %ecx
000000000006689f	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
00000000000668a4	testq	%rax, %rax
00000000000668a7	je	0x668b6
00000000000668a9	movsd	-0x50(%rbp), %xmm0
00000000000668ae	movq	%rax, %rdi
00000000000668b1	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
00000000000668b6	movq	0x8(%r12), %rdi
00000000000668bb	movaps	0x4904e(%rip), %xmm0
00000000000668c2	leaq	-0x40(%rbp), %rsi
00000000000668c6	movaps	%xmm0, (%rsi)
00000000000668c9	callq	__ZNK9OZFactory13isKindOfClassE6PCUUID ## OZFactory::isKindOfClass(PCUUID) const
00000000000668ce	testb	%al, %al
00000000000668d0	je	0x66962
00000000000668d6	leaq	-0x40(%rbp), %rdi
00000000000668da	callq	0xacd1a                         ## symbol stub for: __ZN8PCStringC1Ev
00000000000668df	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
00000000000668e6	leaq	__ZTI18OZChannelBlindData(%rip), %rdx ## typeinfo for OZChannelBlindData
00000000000668ed	movq	%r12, %rdi
00000000000668f0	xorl	%ecx, %ecx
00000000000668f2	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
00000000000668f7	testq	%rax, %rax
00000000000668fa	je	0x669d8
0000000000066900	movq	%rax, %r15
0000000000066903	movq	(%r14), %rax
0000000000066906	leaq	-0x40(%rbp), %rdx
000000000006690a	movq	%r14, %rdi
000000000006690d	movl	$0x72, %esi
0000000000066912	callq	*0x60(%rax)
0000000000066915	testb	%al, %al
0000000000066917	je	0x669b7
000000000006691d	movq	(%r15), %rax
0000000000066920	movq	0x63b99(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000066927	movq	%r15, %rdi
000000000006692a	callq	*0x260(%rax)
0000000000066930	leaq	-0x48(%rbp), %rdi
0000000000066934	leaq	-0x40(%rbp), %rsi
0000000000066938	callq	0xacd14                         ## symbol stub for: __ZN8PCStringC1ERKS_
000000000006693d	leaq	-0x48(%rbp), %rsi
0000000000066941	movq	%r15, %rdi
0000000000066944	callq	__ZN18OZChannelBlindData7setDataE8PCString ## OZChannelBlindData::setData(PCString)
0000000000066949	leaq	-0x48(%rbp), %rdi
000000000006694d	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000066952	jmp	0x669d8
0000000000066957	movq	(%rbx), %rax
000000000006695a	movq	%rbx, %rdi
000000000006695d	callq	*0x28(%rax)
0000000000066960	jmp	0x669e1
0000000000066962	leaq	-0x50(%rbp), %rcx
0000000000066966	movq	%rbx, %rdi
0000000000066969	movq	%r14, %rsi
000000000006696c	movl	$0x72, %edx
0000000000066971	callq	0xacd44                         ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd
0000000000066976	testb	%al, %al
0000000000066978	je	0x669a6
000000000006697a	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
0000000000066981	leaq	__ZTI9OZChannel(%rip), %rdx     ## typeinfo for OZChannel
0000000000066988	movq	%r12, %rdi
000000000006698b	xorl	%ecx, %ecx
000000000006698d	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
0000000000066992	testq	%rax, %rax
0000000000066995	je	0x669a6
0000000000066997	movsd	-0x50(%rbp), %xmm0
000000000006699c	movq	%rax, %rdi
000000000006699f	xorl	%esi, %esi
00000000000669a1	callq	__ZN9OZChannel15setInitialValueEdb ## OZChannel::setInitialValue(double, bool)
00000000000669a6	addq	$0x10, %r12
00000000000669aa	movq	%rbx, %rdi
00000000000669ad	movq	%r12, %rsi
00000000000669b0	callq	0xacc42                         ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
00000000000669b5	jmp	0x669e1
00000000000669b7	movq	%r15, %rsi
00000000000669ba	addq	$0x10, %rsi
00000000000669be	movq	%rbx, %rdi
00000000000669c1	callq	0xacc42                         ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
00000000000669c6	movq	(%r15), %rax
00000000000669c9	movq	%r15, %rdi
00000000000669cc	movq	%rbx, %rsi
00000000000669cf	movq	%r14, %rdx
00000000000669d2	callq	*0x1b8(%rax)
00000000000669d8	leaq	-0x40(%rbp), %rdi
00000000000669dc	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000669e1	movb	$0x1, %al
00000000000669e3	addq	$0x48, %rsp
00000000000669e7	popq	%rbx
00000000000669e8	popq	%r12
00000000000669ea	popq	%r13
00000000000669ec	popq	%r14
00000000000669ee	popq	%r15
00000000000669f0	popq	%rbp
00000000000669f1	retq
00000000000669f2	movq	%rax, %rbx
00000000000669f5	leaq	-0x48(%rbp), %rdi
00000000000669f9	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000669fe	jmp	0x66a05
0000000000066a00	jmp	0x66a02
0000000000066a02	movq	%rax, %rbx
0000000000066a05	leaq	-0x40(%rbp), %rdi
0000000000066a09	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000066a0e	movq	%rbx, %rdi
0000000000066a11	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
