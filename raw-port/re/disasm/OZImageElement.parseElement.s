__ZN14OZImageElement12parseElementER22PCSerializerReadStreamR15PCStreamElement:
00000000005f8770	pushq	%rbp
00000000005f8771	movq	%rsp, %rbp
00000000005f8774	pushq	%r15
00000000005f8776	pushq	%r14
00000000005f8778	pushq	%r12
00000000005f877a	pushq	%rbx
00000000005f877b	subq	$0x70, %rsp
00000000005f877f	movq	%rdx, %r14
00000000005f8782	movq	%rsi, %r15
00000000005f8785	movq	%rdi, %rbx
00000000005f8788	movl	$0x0, -0x24(%rbp)
00000000005f878f	callq	__ZN9OZElement12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZElement::parseElement(PCSerializerReadStream&, PCStreamElement&)
00000000005f8794	movl	0x8(%r14), %eax
00000000005f8798	decl	%eax
00000000005f879a	cmpl	$0x5, %eax
00000000005f879d	ja	0x5f89d8
00000000005f87a3	leaq	0x282(%rip), %rcx
00000000005f87aa	movslq	(%rcx,%rax,4), %rax
00000000005f87ae	addq	%rcx, %rax
00000000005f87b1	jmpq	*%rax
00000000005f87b3	movq	(%r14), %rax
00000000005f87b6	leaq	-0x34(%rbp), %rsi
00000000005f87ba	movq	%r14, %rdi
00000000005f87bd	callq	*0x20(%rax)
00000000005f87c0	leaq	0x5720(%rbx), %r14
00000000005f87c7	movq	$0x0, -0x90(%rbp)
00000000005f87d2	movq	0x5790(%rbx), %rax
00000000005f87d9	movq	0x8(%rax), %rdi
00000000005f87dd	movq	(%rdi), %rax
00000000005f87e0	leaq	-0x90(%rbp), %rsi
00000000005f87e7	callq	*0x100(%rax)
00000000005f87ed	movl	-0x34(%rbp), %eax
00000000005f87f0	cvtsi2sd	%rax, %xmm0
00000000005f87f5	ucomisd	-0x90(%rbp), %xmm0
00000000005f87fd	jbe	0x5f8812
00000000005f87ff	movq	%r14, %rdi
00000000005f8802	callq	0x6df432                        ## symbol stub for: __ZN9OZChannel6setMaxEd
00000000005f8807	movl	-0x34(%rbp), %eax
00000000005f880a	xorps	%xmm0, %xmm0
00000000005f880d	cvtsi2sd	%rax, %xmm0
00000000005f8812	movq	0x22bcf7(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000005f8819	movq	%r14, %rdi
00000000005f881c	xorl	%edx, %edx
00000000005f881e	callq	0x6df456                        ## symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
00000000005f8823	jmp	0x5f89d8
00000000005f8828	leaq	0x73f1(%rbx), %rsi
00000000005f882f	movq	(%r14), %rax
00000000005f8832	movq	%r14, %rdi
00000000005f8835	callq	*0x48(%rax)
00000000005f8838	jmp	0x5f89d8
00000000005f883d	movq	(%r14), %rax
00000000005f8840	leaq	-0x24(%rbp), %rsi
00000000005f8844	movq	%r14, %rdi
00000000005f8847	callq	*0x20(%rax)
00000000005f884a	movl	-0x24(%rbp), %eax
00000000005f884d	leaq	0x4b70(%rbx), %r14
00000000005f8854	testl	%eax, %eax
00000000005f8856	je	0x5f8976
00000000005f885c	movl	%eax, %eax
00000000005f885e	cvtsi2sd	%rax, %xmm0
00000000005f8863	movq	%r14, %rdi
00000000005f8866	callq	0x6df432                        ## symbol stub for: __ZN9OZChannel6setMaxEd
00000000005f886b	movl	-0x24(%rbp), %eax
00000000005f886e	xorps	%xmm0, %xmm0
00000000005f8871	cvtsi2sd	%rax, %xmm0
00000000005f8876	movq	%r14, %rdi
00000000005f8879	callq	0x6df2b2                        ## symbol stub for: __ZN9OZChannel12setSliderMaxEd
00000000005f887e	movl	$0x2, %esi
00000000005f8883	movq	%r14, %rdi
00000000005f8886	xorl	%edx, %edx
00000000005f8888	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000005f888d	jmp	0x5f89d8
00000000005f8892	leaq	0x7d48(%rbx), %rsi
00000000005f8899	movq	(%r14), %rax
00000000005f889c	movq	%r14, %rdi
00000000005f889f	callq	*0x20(%rax)
00000000005f88a2	jmp	0x5f89d8
00000000005f88a7	leaq	-0x30(%rbp), %r12
00000000005f88ab	movq	%r12, %rdi
00000000005f88ae	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
00000000005f88b3	movq	%r15, %rdi
00000000005f88b6	movq	%r14, %rsi
00000000005f88b9	movq	%r12, %rdx
00000000005f88bc	callq	0x6de77e                        ## symbol stub for: __ZN22PCSerializerReadStream11getAsStringER15PCStreamElementP8PCString
00000000005f88c1	leaq	-0x90(%rbp), %rdi
00000000005f88c8	callq	0x6dda82                        ## symbol stub for: __ZN13PCAsciiStreamC1Ev
00000000005f88cd	leaq	-0x30(%rbp), %rdi
00000000005f88d1	callq	0x6dfa2c                        ## symbol stub for: __ZNK8PCString4sizeEv
00000000005f88d6	movl	%eax, %edi
00000000005f88d8	callq	0x6dff7e                        ## symbol stub for: _malloc
00000000005f88dd	movq	%rax, %r14
00000000005f88e0	leaq	-0x30(%rbp), %rdi
00000000005f88e4	callq	0x6dfa02                        ## symbol stub for: __ZNK8PCString10createCStrEv
00000000005f88e9	movq	%rax, %r15
00000000005f88ec	leaq	-0x90(%rbp), %rdi
00000000005f88f3	movq	%rax, %rsi
00000000005f88f6	callq	0x6dda6a                        ## symbol stub for: __ZN13PCAsciiStream4openEPKc
00000000005f88fb	leaq	-0x30(%rbp), %rdi
00000000005f88ff	callq	0x6dfa2c                        ## symbol stub for: __ZNK8PCString4sizeEv
00000000005f8904	movl	%eax, %edx
00000000005f8906	leaq	-0x90(%rbp), %rdi
00000000005f890d	movq	%r14, %rsi
00000000005f8910	callq	0x6dda70                        ## symbol stub for: __ZN13PCAsciiStream4readEPvy
00000000005f8915	movq	%rax, %r12
00000000005f8918	leaq	-0x90(%rbp), %rdi
00000000005f891f	callq	0x6dda76                        ## symbol stub for: __ZN13PCAsciiStream5closeEv
00000000005f8924	movq	%r15, %rdi
00000000005f8927	callq	0x6dfe3a                        ## symbol stub for: _free
00000000005f892c	movq	0x22e005(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSData
00000000005f8933	movq	0x319926(%rip), %rsi
00000000005f893a	movq	%r14, %rdx
00000000005f893d	movq	%r12, %rcx
00000000005f8940	callq	*0x22d6e2(%rip)                 ## Objc message: -[%rdi identifiersForShortIdentifiers:]
00000000005f8946	movq	%rax, %r14
00000000005f8949	movl	0x7d48(%rbx), %eax
00000000005f894f	cmpl	$0x1, %eax
00000000005f8952	je	0x5f89a7
00000000005f8954	testl	%eax, %eax
00000000005f8956	jne	0x5f89c3
00000000005f8958	movq	0x7488(%rbx), %rdi
00000000005f895f	callq	*0x22d70b(%rip)                 ## literal pool symbol address: _objc_release
00000000005f8965	movq	%r14, %rdi
00000000005f8968	callq	__ZL24getScriptChangesFromDataP6NSData ## getScriptChangesFromData(NSData*)
00000000005f896d	movq	%rax, 0x7488(%rbx)
00000000005f8974	jmp	0x5f89c3
00000000005f8976	movsd	0x10ca62(%rip), %xmm0
00000000005f897e	movq	%r14, %rdi
00000000005f8981	callq	0x6df432                        ## symbol stub for: __ZN9OZChannel6setMaxEd
00000000005f8986	movq	%r14, %rdi
00000000005f8989	movsd	0x10ca4f(%rip), %xmm0
00000000005f8991	callq	0x6df2b2                        ## symbol stub for: __ZN9OZChannel12setSliderMaxEd
00000000005f8996	movl	$0x2, %esi
00000000005f899b	movq	%r14, %rdi
00000000005f899e	xorl	%edx, %edx
00000000005f89a0	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000005f89a5	jmp	0x5f89d8
00000000005f89a7	movq	0x7480(%rbx), %rdi
00000000005f89ae	callq	*0x22d6bc(%rip)                 ## literal pool symbol address: _objc_release
00000000005f89b4	movq	%r14, %rdi
00000000005f89b7	callq	__ZL24getScriptChangesFromDataP6NSData ## getScriptChangesFromData(NSData*)
00000000005f89bc	movq	%rax, 0x7480(%rbx)
00000000005f89c3	leaq	-0x90(%rbp), %rdi
00000000005f89ca	callq	0x6dda88                        ## symbol stub for: __ZN13PCAsciiStreamD1Ev
00000000005f89cf	leaq	-0x30(%rbp), %rdi
00000000005f89d3	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000005f89d8	movl	-0x24(%rbp), %eax
00000000005f89db	movl	%eax, 0x7428(%rbx)
00000000005f89e1	movb	$0x1, %al
00000000005f89e3	addq	$0x70, %rsp
00000000005f89e7	popq	%rbx
00000000005f89e8	popq	%r12
00000000005f89ea	popq	%r14
00000000005f89ec	popq	%r15
00000000005f89ee	popq	%rbp
00000000005f89ef	retq
00000000005f89f0	jmp	0x5f8a0c
00000000005f89f2	jmp	0x5f89f4
00000000005f89f4	movq	%rax, %rbx
00000000005f89f7	leaq	-0x30(%rbp), %rdi
00000000005f89fb	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000005f8a00	movq	%rbx, %rdi
00000000005f8a03	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000005f8a08	jmp	0x5f8a0c
00000000005f8a0a	jmp	0x5f8a0c
00000000005f8a0c	movq	%rax, %rbx
00000000005f8a0f	leaq	-0x90(%rbp), %rdi
00000000005f8a16	callq	0x6dda88                        ## symbol stub for: __ZN13PCAsciiStreamD1Ev
00000000005f8a1b	leaq	-0x30(%rbp), %rdi
00000000005f8a1f	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000005f8a24	movq	%rbx, %rdi
00000000005f8a27	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000005f8a2c	xchgl	%ebp, %edi
00000000005f8a2e	.byte 0xff #bad opcode
00000000005f8a2f	callq	*(%rcx)
00000000005f8a31	.byte 0xfe #bad opcode
00000000005f8a32	.byte 0xff #bad opcode
00000000005f8a33	.byte 0xff #bad opcode
00000000005f8a34	cld
00000000005f8a35	std
00000000005f8a36	.byte 0xff #bad opcode
00000000005f8a37	ljmpl	*-0x1990001(%rdi,%rdi,8)
00000000005f8a3e	.byte 0xff #bad opcode
00000000005f8a3f	.byte 0xff #bad opcode
00000000005f8a40	jnp	0x5f8a40
00000000005f8a42	.byte 0xff #bad opcode
00000000005f8a43	jmpq	*0x66(%rsi)
00000000005f8a46	nopw	%cs:(%rax,%rax)
