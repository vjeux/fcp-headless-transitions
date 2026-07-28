__ZN21PCBinaryXMLReadStream12parseElementEv:
000000000006492c	pushq	%rbp
000000000006492d	movq	%rsp, %rbp
0000000000064930	pushq	%r15
0000000000064932	pushq	%r14
0000000000064934	pushq	%r13
0000000000064936	pushq	%r12
0000000000064938	pushq	%rbx
0000000000064939	subq	$0xa8, %rsp
0000000000064940	movq	0xe38d9(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
0000000000064947	movq	(%rax), %rax
000000000006494a	movq	%rax, -0x30(%rbp)
000000000006494e	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
0000000000064954	cmpb	$0x0, 0xb1(%rdi)
000000000006495b	jne	0x64daa
0000000000064961	movq	%rdi, %rbx
0000000000064964	xorl	%r14d, %r14d
0000000000064967	cmpb	$0x0, 0xb0(%rdi)
000000000006496e	jne	0x64daa
0000000000064974	movq	%rbx, %rdi
0000000000064977	callq	__ZNK22PCSerializerReadStream14currentElementEv ## PCSerializerReadStream::currentElement() const
000000000006497c	testq	%rax, %rax
000000000006497f	je	0x649c3
0000000000064981	leaq	__ZTI15PCStreamElement(%rip), %rsi ## typeinfo for PCStreamElement
0000000000064988	leaq	__ZTI24PCBinaryXMLStreamElement(%rip), %rdx ## typeinfo for PCBinaryXMLStreamElement
000000000006498f	movq	%rax, %rdi
0000000000064992	xorl	%ecx, %ecx
0000000000064994	callq	0xde720                         ## symbol stub for: ___dynamic_cast
0000000000064999	testq	%rax, %rax
000000000006499c	je	0x649c3
000000000006499e	movq	%rax, %r15
00000000000649a1	cmpb	$0x0, 0xc(%rax)
00000000000649a5	jne	0x649c3
00000000000649a7	movq	%rbx, %rdi
00000000000649aa	movq	%r15, %rsi
00000000000649ad	callq	__ZN22PCSerializerReadStream14processElementER15PCStreamElement ## PCSerializerReadStream::processElement(PCStreamElement&)
00000000000649b2	movl	$0x1, %r14d
00000000000649b8	cmpb	$0x0, 0x28(%r15)
00000000000649bd	jne	0x64daa
00000000000649c3	movq	0x98(%rbx), %rsi
00000000000649ca	leaq	-0x8c(%rbp), %rdx
00000000000649d1	callq	__ZN21PCBinaryXMLReadStream10readVarIntER8PCStreamPj ## PCBinaryXMLReadStream::readVarInt(PCStream&, unsigned int*)
00000000000649d6	movl	$0x0, %r14d
00000000000649dc	testb	%al, %al
00000000000649de	je	0x64daa
00000000000649e4	movq	0x98(%rbx), %rdi
00000000000649eb	movq	(%rdi), %rax
00000000000649ee	leaq	-0x88(%rbp), %rsi
00000000000649f5	movl	$0x4, %edx
00000000000649fa	callq	*0x10(%rax)
00000000000649fd	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
0000000000064a03	cmpq	$0x4, %rax
0000000000064a07	jne	0x64daa
0000000000064a0d	movq	0x98(%rbx), %rdi
0000000000064a14	movq	(%rdi), %rax
0000000000064a17	callq	*0x20(%rax)
0000000000064a1a	movq	%rax, %r14
0000000000064a1d	movl	-0x88(%rbp), %r15d
0000000000064a24	movl	-0x8c(%rbp), %esi
0000000000064a2a	leaq	-0xa8(%rbp), %rdx
0000000000064a31	leaq	-0xb0(%rbp), %rcx
0000000000064a38	leaq	-0xa0(%rbp), %r8
0000000000064a3f	movq	%rbx, %rdi
0000000000064a42	callq	__ZN22PCSerializerReadStream14getElementInfoEjPP7PCScopeS2_PP12PCSerializer ## PCSerializerReadStream::getElementInfo(unsigned int, PCScope**, PCScope**, PCSerializer**)
0000000000064a47	addq	%r15, %r14
0000000000064a4a	testb	%al, %al
0000000000064a4c	je	0x64d94
0000000000064a52	movl	$0xa0, %edi
0000000000064a57	callq	0xde6cc                         ## symbol stub for: __Znwm
0000000000064a5c	movq	%rax, %r15
0000000000064a5f	movq	-0xa8(%rbp), %rax
0000000000064a66	movl	0x8(%rax), %esi
0000000000064a69	movq	-0xb0(%rbp), %rdx
0000000000064a70	movq	-0xa0(%rbp), %rcx
0000000000064a77	movq	%r15, %rdi
0000000000064a7a	callq	__ZN24PCBinaryXMLStreamElementC2EjP7PCScopeP12PCSerializer ## PCBinaryXMLStreamElement::PCBinaryXMLStreamElement(unsigned int, PCScope*, PCSerializer*)
0000000000064a7f	movq	%rbx, %rdi
0000000000064a82	movq	%r15, %rsi
0000000000064a85	callq	__ZN22PCSerializerReadStream11pushElementEP15PCStreamElement ## PCSerializerReadStream::pushElement(PCStreamElement*)
0000000000064a8a	movq	%r14, 0x20(%r15)
0000000000064a8e	movq	0x98(%rbx), %rsi
0000000000064a95	leaq	-0x84(%rbp), %rdx
0000000000064a9c	callq	__ZN21PCBinaryXMLReadStream10readVarIntER8PCStreamPj ## PCBinaryXMLReadStream::readVarInt(PCStream&, unsigned int*)
0000000000064aa1	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
0000000000064aa7	testb	%al, %al
0000000000064aa9	je	0x64daa
0000000000064aaf	movl	-0x84(%rbp), %r13d
0000000000064ab6	testl	%r13d, %r13d
0000000000064ab9	je	0x64dd3
0000000000064abf	movq	0x98(%rbx), %rsi
0000000000064ac6	leaq	-0x48(%rbp), %rdx
0000000000064aca	callq	__ZN21PCBinaryXMLReadStream10readVarIntER8PCStreamPj ## PCBinaryXMLReadStream::readVarInt(PCStream&, unsigned int*)
0000000000064acf	testb	%al, %al
0000000000064ad1	je	0x64daa
0000000000064ad7	movq	0x98(%rbx), %rdi
0000000000064ade	movq	(%rdi), %rax
0000000000064ae1	movl	$0x1, %edx
0000000000064ae6	leaq	-0x41(%rbp), %rsi
0000000000064aea	callq	*0x10(%rax)
0000000000064aed	cmpq	$0x1, %rax
0000000000064af1	jne	0x64daa
0000000000064af7	movzbl	-0x41(%rbp), %edx
0000000000064afb	leal	-0x8(%rdx), %eax
0000000000064afe	cmpl	$0x2a, %eax
0000000000064b01	ja	0x64bc6
0000000000064b07	leaq	0x5ee(%rip), %rcx
0000000000064b0e	movslq	(%rcx,%rax,4), %rax
0000000000064b12	addq	%rcx, %rax
0000000000064b15	jmpq	*%rax
0000000000064b17	movq	0x98(%rbx), %rsi
0000000000064b1e	leaq	-0x60(%rbp), %rcx
0000000000064b22	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPy ## PCBinaryXMLReadStream::readInt(PCStream&, int, unsigned long long*)
0000000000064b27	testb	%al, %al
0000000000064b29	je	0x64daa
0000000000064b2f	movl	-0x60(%rbp), %edx
0000000000064b32	movl	-0x48(%rbp), %esi
0000000000064b35	movq	%r15, %rdi
0000000000064b38	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjy ## PCBinaryXMLStreamElement::addAttribute(unsigned int, unsigned long long)
0000000000064b3d	jmp	0x64bb8
0000000000064b3f	movq	0x98(%rbx), %rsi
0000000000064b46	leaq	-0x78(%rbp), %rcx
0000000000064b4a	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPx ## PCBinaryXMLReadStream::readInt(PCStream&, int, long long*)
0000000000064b4f	testb	%al, %al
0000000000064b51	je	0x64daa
0000000000064b57	movl	-0x48(%rbp), %esi
0000000000064b5a	movq	-0x78(%rbp), %rdx
0000000000064b5e	movq	%r15, %rdi
0000000000064b61	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjx ## PCBinaryXMLStreamElement::addAttribute(unsigned int, long long)
0000000000064b66	jmp	0x64bb8
0000000000064b68	movq	0x98(%rbx), %rsi
0000000000064b6f	leaq	-0x60(%rbp), %rcx
0000000000064b73	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPx ## PCBinaryXMLReadStream::readInt(PCStream&, int, long long*)
0000000000064b78	testb	%al, %al
0000000000064b7a	je	0x64daa
0000000000064b80	movslq	-0x60(%rbp), %rdx
0000000000064b84	movl	-0x48(%rbp), %esi
0000000000064b87	movq	%r15, %rdi
0000000000064b8a	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjx ## PCBinaryXMLStreamElement::addAttribute(unsigned int, long long)
0000000000064b8f	jmp	0x64bb8
0000000000064b91	movq	0x98(%rbx), %rsi
0000000000064b98	leaq	-0x80(%rbp), %rcx
0000000000064b9c	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPy ## PCBinaryXMLReadStream::readInt(PCStream&, int, unsigned long long*)
0000000000064ba1	testb	%al, %al
0000000000064ba3	je	0x64daa
0000000000064ba9	movl	-0x48(%rbp), %esi
0000000000064bac	movq	-0x80(%rbp), %rdx
0000000000064bb0	movq	%r15, %rdi
0000000000064bb3	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjy ## PCBinaryXMLStreamElement::addAttribute(unsigned int, unsigned long long)
0000000000064bb8	decl	%r13d
0000000000064bbb	je	0x64dd3
0000000000064bc1	jmp	0x64abf
0000000000064bc6	cmpl	$0x80, %edx
0000000000064bcc	je	0x64d56
0000000000064bd2	cmpl	$0x81, %edx
0000000000064bd8	jne	0x64bb8
0000000000064bda	movl	-0x48(%rbp), %esi
0000000000064bdd	movl	$0x1, %edx
0000000000064be2	movq	%r15, %rdi
0000000000064be5	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjy ## PCBinaryXMLStreamElement::addAttribute(unsigned int, unsigned long long)
0000000000064bea	jmp	0x64bb8
0000000000064bec	movq	0x98(%rbx), %rsi
0000000000064bf3	leaq	-0x64(%rbp), %rdx
0000000000064bf7	callq	__ZN21PCBinaryXMLReadStream10readVarIntER8PCStreamPj ## PCBinaryXMLReadStream::readVarInt(PCStream&, unsigned int*)
0000000000064bfc	testb	%al, %al
0000000000064bfe	je	0x64daa
0000000000064c04	movl	-0x64(%rbp), %r12d
0000000000064c08	testq	%r12, %r12
0000000000064c0b	je	0x64d68
0000000000064c11	leal	0x1(%r12), %edi
0000000000064c16	callq	0xde94e                         ## symbol stub for: _malloc
0000000000064c1b	movq	%rax, %rsi
0000000000064c1e	movq	0x98(%rbx), %rdi
0000000000064c25	movq	(%rdi), %rax
0000000000064c28	movq	%rsi, -0x98(%rbp)
0000000000064c2f	movq	%r12, %rdx
0000000000064c32	callq	*0x10(%rax)
0000000000064c35	cmpq	%r12, %rax
0000000000064c38	jne	0x64daa
0000000000064c3e	movq	-0x98(%rbp), %rsi
0000000000064c45	movb	$0x0, (%rsi,%r12)
0000000000064c4a	movl	-0x48(%rbp), %r12d
0000000000064c4e	leaq	-0x60(%rbp), %rdi
0000000000064c52	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
0000000000064c57	movq	%r15, %rdi
0000000000064c5a	movl	%r12d, %esi
0000000000064c5d	leaq	-0x60(%rbp), %r12
0000000000064c61	movq	%r12, %rdx
0000000000064c64	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjRK8PCString ## PCBinaryXMLStreamElement::addAttribute(unsigned int, PCString const&)
0000000000064c69	movq	%r12, %rdi
0000000000064c6c	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000064c71	movq	-0x98(%rbp), %rdi
0000000000064c78	callq	0xde89a                         ## symbol stub for: _free
0000000000064c7d	jmp	0x64bb8
0000000000064c82	movq	0x98(%rbx), %rsi
0000000000064c89	leaq	-0xc8(%rbp), %rdx
0000000000064c90	callq	__ZN21PCBinaryXMLReadStream11readFigtimeER8PCStreamP6CMTime ## PCBinaryXMLReadStream::readFigtime(PCStream&, CMTime*)
0000000000064c95	testb	%al, %al
0000000000064c97	je	0x64daa
0000000000064c9d	movl	-0x48(%rbp), %esi
0000000000064ca0	movq	%r15, %rdi
0000000000064ca3	leaq	-0xc8(%rbp), %rdx
0000000000064caa	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjRK6CMTime ## PCBinaryXMLStreamElement::addAttribute(unsigned int, CMTime const&)
0000000000064caf	jmp	0x64bb8
0000000000064cb4	movq	0x98(%rbx), %rdi
0000000000064cbb	movq	(%rdi), %rax
0000000000064cbe	movl	$0x8, %edx
0000000000064cc3	leaq	-0x70(%rbp), %rsi
0000000000064cc7	callq	*0x10(%rax)
0000000000064cca	cmpq	$0x8, %rax
0000000000064cce	jne	0x64daa
0000000000064cd4	movl	-0x48(%rbp), %esi
0000000000064cd7	movsd	-0x70(%rbp), %xmm0
0000000000064cdc	movq	%r15, %rdi
0000000000064cdf	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjd ## PCBinaryXMLStreamElement::addAttribute(unsigned int, double)
0000000000064ce4	jmp	0x64bb8
0000000000064ce9	movq	0x98(%rbx), %rdi
0000000000064cf0	movq	(%rdi), %rax
0000000000064cf3	movl	$0x4, %edx
0000000000064cf8	leaq	-0x68(%rbp), %rsi
0000000000064cfc	callq	*0x10(%rax)
0000000000064cff	cmpq	$0x4, %rax
0000000000064d03	jne	0x64daa
0000000000064d09	movl	-0x48(%rbp), %esi
0000000000064d0c	movss	-0x68(%rbp), %xmm0
0000000000064d11	movq	%r15, %rdi
0000000000064d14	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjf ## PCBinaryXMLStreamElement::addAttribute(unsigned int, float)
0000000000064d19	jmp	0x64bb8
0000000000064d1e	movq	0x98(%rbx), %rdi
0000000000064d25	movq	(%rdi), %rax
0000000000064d28	movl	$0x10, %edx
0000000000064d2d	leaq	-0x40(%rbp), %rsi
0000000000064d31	callq	*0x10(%rax)
0000000000064d34	cmpq	$0x10, %rax
0000000000064d38	jne	0x64daa
0000000000064d3a	movl	-0x48(%rbp), %esi
0000000000064d3d	movaps	-0x40(%rbp), %xmm0
0000000000064d41	movaps	%xmm0, -0x60(%rbp)
0000000000064d45	movq	%r15, %rdi
0000000000064d48	leaq	-0x60(%rbp), %rdx
0000000000064d4c	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjRK6PCUUID ## PCBinaryXMLStreamElement::addAttribute(unsigned int, PCUUID const&)
0000000000064d51	jmp	0x64bb8
0000000000064d56	movl	-0x48(%rbp), %esi
0000000000064d59	movq	%r15, %rdi
0000000000064d5c	xorl	%edx, %edx
0000000000064d5e	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjy ## PCBinaryXMLStreamElement::addAttribute(unsigned int, unsigned long long)
0000000000064d63	jmp	0x64bb8
0000000000064d68	movl	-0x48(%rbp), %r12d
0000000000064d6c	leaq	-0x60(%rbp), %rdi
0000000000064d70	callq	__ZN8PCStringC1Ev               ## PCString::PCString()
0000000000064d75	movq	%r15, %rdi
0000000000064d78	movl	%r12d, %esi
0000000000064d7b	leaq	-0x60(%rbp), %r12
0000000000064d7f	movq	%r12, %rdx
0000000000064d82	callq	__ZN24PCBinaryXMLStreamElement12addAttributeEjRK8PCString ## PCBinaryXMLStreamElement::addAttribute(unsigned int, PCString const&)
0000000000064d87	movq	%r12, %rdi
0000000000064d8a	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000064d8f	jmp	0x64bb8
0000000000064d94	movq	0x98(%rbx), %rdi
0000000000064d9b	movq	(%rdi), %rax
0000000000064d9e	movq	%r14, %rsi
0000000000064da1	callq	*0x28(%rax)
0000000000064da4	movl	$0x1, %r14d
0000000000064daa	movq	0xe346f(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
0000000000064db1	movq	(%rax), %rax
0000000000064db4	cmpq	-0x30(%rbp), %rax
0000000000064db8	jne	0x650cb
0000000000064dbe	movl	%r14d, %eax
0000000000064dc1	addq	$0xa8, %rsp
0000000000064dc8	popq	%rbx
0000000000064dc9	popq	%r12
0000000000064dcb	popq	%r13
0000000000064dcd	popq	%r14
0000000000064dcf	popq	%r15
0000000000064dd1	popq	%rbp
0000000000064dd2	retq
0000000000064dd3	movq	0x98(%rbx), %rdi
0000000000064dda	movq	(%rdi), %rax
0000000000064ddd	callq	*0x20(%rax)
0000000000064de0	cmpq	0x20(%r15), %rax
0000000000064de4	jae	0x6508f
0000000000064dea	movq	0x98(%rbx), %rdi
0000000000064df1	movq	(%rdi), %rax
0000000000064df4	movl	$0x1, %edx
0000000000064df9	leaq	-0x41(%rbp), %rsi
0000000000064dfd	callq	*0x10(%rax)
0000000000064e00	cmpq	$0x1, %rax
0000000000064e04	jne	0x64daa
0000000000064e06	movzbl	-0x41(%rbp), %edx
0000000000064e0a	cmpq	$0x32, %rdx
0000000000064e0e	ja	0x64ec7
0000000000064e14	leaq	0x38d(%rip), %rcx
0000000000064e1b	movslq	(%rcx,%rdx,4), %rax
0000000000064e1f	addq	%rcx, %rax
0000000000064e22	jmpq	*%rax
0000000000064e24	movq	0x98(%rbx), %rsi
0000000000064e2b	leaq	-0x60(%rbp), %rcx
0000000000064e2f	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPy ## PCBinaryXMLReadStream::readInt(PCStream&, int, unsigned long long*)
0000000000064e34	testb	%al, %al
0000000000064e36	je	0x64daa
0000000000064e3c	movl	-0x60(%rbp), %esi
0000000000064e3f	movq	%r15, %rdi
0000000000064e42	callq	__ZN24PCBinaryXMLStreamElement10setContentEy ## PCBinaryXMLStreamElement::setContent(unsigned long long)
0000000000064e47	jmp	0x6507d
0000000000064e4c	movq	0x98(%rbx), %rsi
0000000000064e53	leaq	-0x80(%rbp), %rcx
0000000000064e57	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPy ## PCBinaryXMLReadStream::readInt(PCStream&, int, unsigned long long*)
0000000000064e5c	testb	%al, %al
0000000000064e5e	je	0x64daa
0000000000064e64	movq	-0x80(%rbp), %rsi
0000000000064e68	movq	%r15, %rdi
0000000000064e6b	callq	__ZN24PCBinaryXMLStreamElement10setContentEy ## PCBinaryXMLStreamElement::setContent(unsigned long long)
0000000000064e70	jmp	0x6507d
0000000000064e75	movq	0x98(%rbx), %rsi
0000000000064e7c	leaq	-0x60(%rbp), %rcx
0000000000064e80	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPx ## PCBinaryXMLReadStream::readInt(PCStream&, int, long long*)
0000000000064e85	testb	%al, %al
0000000000064e87	je	0x64daa
0000000000064e8d	movslq	-0x60(%rbp), %rsi
0000000000064e91	movq	%r15, %rdi
0000000000064e94	callq	__ZN24PCBinaryXMLStreamElement10setContentEx ## PCBinaryXMLStreamElement::setContent(long long)
0000000000064e99	jmp	0x6507d
0000000000064e9e	movq	0x98(%rbx), %rsi
0000000000064ea5	leaq	-0x78(%rbp), %rcx
0000000000064ea9	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPx ## PCBinaryXMLReadStream::readInt(PCStream&, int, long long*)
0000000000064eae	testb	%al, %al
0000000000064eb0	je	0x64daa
0000000000064eb6	movq	-0x78(%rbp), %rsi
0000000000064eba	movq	%r15, %rdi
0000000000064ebd	callq	__ZN24PCBinaryXMLStreamElement10setContentEx ## PCBinaryXMLStreamElement::setContent(long long)
0000000000064ec2	jmp	0x6507d
0000000000064ec7	cmpl	$0x80, %edx
0000000000064ecd	je	0x65051
0000000000064ed3	cmpl	$0x81, %edx
0000000000064ed9	jne	0x6507d
0000000000064edf	movl	$0x1, %esi
0000000000064ee4	movq	%r15, %rdi
0000000000064ee7	callq	__ZN24PCBinaryXMLStreamElement10setContentEy ## PCBinaryXMLStreamElement::setContent(unsigned long long)
0000000000064eec	jmp	0x6507d
0000000000064ef1	movq	%rbx, %rdi
0000000000064ef4	callq	__ZN21PCBinaryXMLReadStream12parseElementEv ## PCBinaryXMLReadStream::parseElement()
0000000000064ef9	cmpl	$0x1, %eax
0000000000064efc	jne	0x650c3
0000000000064f02	jmp	0x6507d
0000000000064f07	movq	0x98(%rbx), %rsi
0000000000064f0e	leaq	-0x64(%rbp), %rdx
0000000000064f12	callq	__ZN21PCBinaryXMLReadStream10readVarIntER8PCStreamPj ## PCBinaryXMLReadStream::readVarInt(PCStream&, unsigned int*)
0000000000064f17	testb	%al, %al
0000000000064f19	je	0x64daa
0000000000064f1f	movl	-0x64(%rbp), %r12d
0000000000064f23	testq	%r12, %r12
0000000000064f26	je	0x6505d
0000000000064f2c	leal	0x1(%r12), %edi
0000000000064f31	callq	0xde94e                         ## symbol stub for: _malloc
0000000000064f36	movq	%rax, %r13
0000000000064f39	movq	0x98(%rbx), %rdi
0000000000064f40	movq	(%rdi), %rax
0000000000064f43	movq	%r13, %rsi
0000000000064f46	movq	%r12, %rdx
0000000000064f49	callq	*0x10(%rax)
0000000000064f4c	cmpq	%r12, %rax
0000000000064f4f	jne	0x64daa
0000000000064f55	movb	$0x0, (%r13,%r12)
0000000000064f5b	leaq	-0x60(%rbp), %rdi
0000000000064f5f	movq	%r13, %rsi
0000000000064f62	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
0000000000064f67	movq	%r15, %rdi
0000000000064f6a	leaq	-0x60(%rbp), %r12
0000000000064f6e	movq	%r12, %rsi
0000000000064f71	callq	__ZN24PCBinaryXMLStreamElement10setContentERK8PCString ## PCBinaryXMLStreamElement::setContent(PCString const&)
0000000000064f76	movq	%r12, %rdi
0000000000064f79	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000064f7e	movq	%r13, %rdi
0000000000064f81	callq	0xde89a                         ## symbol stub for: _free
0000000000064f86	jmp	0x6507d
0000000000064f8b	movq	0x98(%rbx), %rsi
0000000000064f92	leaq	-0xc8(%rbp), %rdx
0000000000064f99	callq	__ZN21PCBinaryXMLReadStream11readFigtimeER8PCStreamP6CMTime ## PCBinaryXMLReadStream::readFigtime(PCStream&, CMTime*)
0000000000064f9e	testb	%al, %al
0000000000064fa0	je	0x64daa
0000000000064fa6	movq	%r15, %rdi
0000000000064fa9	leaq	-0xc8(%rbp), %rsi
0000000000064fb0	callq	__ZN24PCBinaryXMLStreamElement10setContentERK6CMTime ## PCBinaryXMLStreamElement::setContent(CMTime const&)
0000000000064fb5	jmp	0x6507d
0000000000064fba	movq	0x98(%rbx), %rdi
0000000000064fc1	movq	(%rdi), %rax
0000000000064fc4	movl	$0x4, %edx
0000000000064fc9	leaq	-0x68(%rbp), %rsi
0000000000064fcd	callq	*0x10(%rax)
0000000000064fd0	cmpq	$0x4, %rax
0000000000064fd4	jne	0x64daa
0000000000064fda	movss	-0x68(%rbp), %xmm0
0000000000064fdf	movq	%r15, %rdi
0000000000064fe2	callq	__ZN24PCBinaryXMLStreamElement10setContentEf ## PCBinaryXMLStreamElement::setContent(float)
0000000000064fe7	jmp	0x6507d
0000000000064fec	movq	0x98(%rbx), %rdi
0000000000064ff3	movq	(%rdi), %rax
0000000000064ff6	movl	$0x8, %edx
0000000000064ffb	leaq	-0x70(%rbp), %rsi
0000000000064fff	callq	*0x10(%rax)
0000000000065002	cmpq	$0x8, %rax
0000000000065006	jne	0x64daa
000000000006500c	movsd	-0x70(%rbp), %xmm0
0000000000065011	movq	%r15, %rdi
0000000000065014	callq	__ZN24PCBinaryXMLStreamElement10setContentEd ## PCBinaryXMLStreamElement::setContent(double)
0000000000065019	jmp	0x6507d
000000000006501b	movq	0x98(%rbx), %rdi
0000000000065022	movq	(%rdi), %rax
0000000000065025	movl	$0x10, %edx
000000000006502a	leaq	-0x40(%rbp), %rsi
000000000006502e	callq	*0x10(%rax)
0000000000065031	cmpq	$0x10, %rax
0000000000065035	jne	0x64daa
000000000006503b	movaps	-0x40(%rbp), %xmm0
000000000006503f	movaps	%xmm0, -0x60(%rbp)
0000000000065043	movq	%r15, %rdi
0000000000065046	leaq	-0x60(%rbp), %rsi
000000000006504a	callq	__ZN24PCBinaryXMLStreamElement10setContentERK6PCUUID ## PCBinaryXMLStreamElement::setContent(PCUUID const&)
000000000006504f	jmp	0x6507d
0000000000065051	movq	%r15, %rdi
0000000000065054	xorl	%esi, %esi
0000000000065056	callq	__ZN24PCBinaryXMLStreamElement10setContentEy ## PCBinaryXMLStreamElement::setContent(unsigned long long)
000000000006505b	jmp	0x6507d
000000000006505d	leaq	-0x60(%rbp), %rdi
0000000000065061	callq	__ZN8PCStringC1Ev               ## PCString::PCString()
0000000000065066	movq	%r15, %rdi
0000000000065069	leaq	-0x60(%rbp), %r12
000000000006506d	movq	%r12, %rsi
0000000000065070	callq	__ZN24PCBinaryXMLStreamElement10setContentERK8PCString ## PCBinaryXMLStreamElement::setContent(PCString const&)
0000000000065075	movq	%r12, %rdi
0000000000065078	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
000000000006507d	movq	0x98(%rbx), %rdi
0000000000065084	movq	(%rdi), %rax
0000000000065087	callq	*0x20(%rax)
000000000006508a	jmp	0x64de0
000000000006508f	cmpb	$0x0, 0xc(%r15)
0000000000065094	jne	0x650a1
0000000000065096	movq	%rbx, %rdi
0000000000065099	movq	%r15, %rsi
000000000006509c	callq	__ZN22PCSerializerReadStream14processElementER15PCStreamElement ## PCSerializerReadStream::processElement(PCStreamElement&)
00000000000650a1	movq	%rbx, %rdi
00000000000650a4	callq	__ZNK22PCSerializerReadStream21currentHandlerElementEv ## PCSerializerReadStream::currentHandlerElement() const
00000000000650a9	cmpq	%rax, %r15
00000000000650ac	jne	0x650b6
00000000000650ae	movq	%rbx, %rdi
00000000000650b1	callq	__ZN22PCSerializerReadStream10popHandlerEv ## PCSerializerReadStream::popHandler()
00000000000650b6	movq	%rbx, %rdi
00000000000650b9	callq	__ZN22PCSerializerReadStream10popElementEv ## PCSerializerReadStream::popElement()
00000000000650be	jmp	0x64da4
00000000000650c3	movl	%eax, %r14d
00000000000650c6	jmp	0x64daa
00000000000650cb	callq	0xde744                         ## symbol stub for: ___stack_chk_fail
00000000000650d0	jmp	0x650d6
00000000000650d2	jmp	0x650d6
00000000000650d4	jmp	0x650d6
00000000000650d6	movq	%rax, %rbx
00000000000650d9	leaq	-0x60(%rbp), %rdi
00000000000650dd	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000650e2	jmp	0x650f4
00000000000650e4	movq	%rax, %rbx
00000000000650e7	movq	%r15, %rdi
00000000000650ea	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000650ef	jmp	0x650f4
00000000000650f1	movq	%rax, %rbx
00000000000650f4	movq	%rbx, %rdi
00000000000650f7	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000650fc	sbbl	%edx, %edi
00000000000650fe	.byte 0xff #bad opcode
00000000000650ff	lcalll	*(%rbx)
0000000000065101	cli
0000000000065102	.byte 0xff #bad opcode
0000000000065103	lcalll	*(%rbx)
0000000000065105	cli
0000000000065106	.byte 0xff #bad opcode
0000000000065107	lcalll	*(%rbx)
0000000000065109	cli
000000000006510a	.byte 0xff #bad opcode
000000000006510b	callq	*-0x6a000006(%rbp)
0000000000065111	cli
0000000000065112	.byte 0xff #bad opcode
0000000000065113	callq	*-0x6a000006(%rbp)
0000000000065119	cli
000000000006511a	.byte 0xff #bad opcode
000000000006511b	.byte 0xff #bad opcode
000000000006511c	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065121	cli
0000000000065122	.byte 0xff #bad opcode
0000000000065123	.byte 0xff #bad opcode
0000000000065124	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065129	cli
000000000006512a	.byte 0xff #bad opcode
000000000006512b	.byte 0xff #bad opcode
000000000006512c	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065131	cli
0000000000065132	.byte 0xff #bad opcode
0000000000065133	.byte 0xff #bad opcode
0000000000065134	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065139	cli
000000000006513a	.byte 0xff #bad opcode
000000000006513b	ljmpl	*-0x1(%rdx,%rdi,8)
000000000006513f	ljmpl	*-0x1(%rdx,%rdi,8)
0000000000065143	ljmpl	*-0x1(%rdx,%rdi,8)
0000000000065147	ljmpl	*-0x1(%rdx,%rdi,8)
000000000006514b	incl	-0x6(%rbx)
000000000006514e	.byte 0xff #bad opcode
000000000006514f	incl	-0x6(%rbx)
0000000000065152	.byte 0xff #bad opcode
0000000000065153	incl	-0x6(%rbx)
0000000000065156	.byte 0xff #bad opcode
0000000000065157	incl	-0x6(%rbx)
000000000006515a	.byte 0xff #bad opcode
000000000006515b	.byte 0xff #bad opcode
000000000006515c	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065161	cli
0000000000065162	.byte 0xff #bad opcode
0000000000065163	.byte 0xff #bad opcode
0000000000065164	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065169	cli
000000000006516a	.byte 0xff #bad opcode
000000000006516b	.byte 0xff #bad opcode
000000000006516c	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065171	cli
0000000000065172	.byte 0xff #bad opcode
0000000000065173	.byte 0xff #bad opcode
0000000000065174	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065179	cli
000000000006517a	.byte 0xff #bad opcode
000000000006517b	.byte 0xff #bad opcode
000000000006517c	inl	%dx, %eax
000000000006517d	sti
000000000006517e	.byte 0xff #bad opcode
000000000006517f	.byte 0xff #bad opcode
0000000000065180	movl	$0x22fffffb, %eax               ## imm = 0x22FFFFFB
0000000000065185	cld
0000000000065186	.byte 0xff #bad opcode
0000000000065187	pushq	%rax
0000000000065189	cli
000000000006518a	.byte 0xff #bad opcode
000000000006518b	.byte 0xff #bad opcode
000000000006518c	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065191	cli
0000000000065192	.byte 0xff #bad opcode
0000000000065193	.byte 0xff #bad opcode
0000000000065194	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
0000000000065199	cli
000000000006519a	.byte 0xff #bad opcode
000000000006519b	.byte 0xff #bad opcode
000000000006519c	movl	$0xbcfffffa, %esp               ## imm = 0xBCFFFFFA
00000000000651a1	cli
00000000000651a2	.byte 0xff #bad opcode
00000000000651a3	incl	0x49fffffb(%rsi)
00000000000651a9	std
00000000000651aa	.byte 0xff #bad opcode
00000000000651ab	callq	*%rbp
00000000000651ad	.byte 0xfe #bad opcode
00000000000651ae	.byte 0xff #bad opcode
00000000000651af	callq	*%rbp
00000000000651b1	.byte 0xfe #bad opcode
00000000000651b2	.byte 0xff #bad opcode
00000000000651b3	callq	*%rbp
00000000000651b5	.byte 0xfe #bad opcode
00000000000651b6	.byte 0xff #bad opcode
00000000000651b7	callq	*%rbp
00000000000651b9	.byte 0xfe #bad opcode
00000000000651ba	.byte 0xff #bad opcode
00000000000651bb	callq	*%rbp
00000000000651bd	.byte 0xfe #bad opcode
00000000000651be	.byte 0xff #bad opcode
00000000000651bf	callq	*%rbp
00000000000651c1	.byte 0xfe #bad opcode
00000000000651c2	.byte 0xff #bad opcode
00000000000651c3	callq	*%rbp
00000000000651c5	.byte 0xfe #bad opcode
00000000000651c6	.byte 0xff #bad opcode
00000000000651c7	.byte 0xff #bad opcode
00000000000651c8	jl	0x651c6
00000000000651ca	.byte 0xff #bad opcode
00000000000651cb	.byte 0xff #bad opcode
00000000000651cc	jl	0x651ca
00000000000651ce	.byte 0xff #bad opcode
00000000000651cf	.byte 0xff #bad opcode
00000000000651d0	jl	0x651ce
00000000000651d2	.byte 0xff #bad opcode
00000000000651d3	.byte 0xff #bad opcode
00000000000651d4	jl	0x651d2
00000000000651d6	.byte 0xff #bad opcode
00000000000651d7	jmpq	*-0x35b0001(%rsp,%rdi,8)
00000000000651de	.byte 0xff #bad opcode
00000000000651df	jmpq	*-0x35b0001(%rsp,%rdi,8)
00000000000651e6	.byte 0xff #bad opcode
00000000000651e7	callq	*%rbp
00000000000651e9	.byte 0xfe #bad opcode
00000000000651ea	.byte 0xff #bad opcode
00000000000651eb	callq	*%rbp
00000000000651ed	.byte 0xfe #bad opcode
00000000000651ee	.byte 0xff #bad opcode
00000000000651ef	callq	*%rbp
00000000000651f1	.byte 0xfe #bad opcode
00000000000651f2	.byte 0xff #bad opcode
00000000000651f3	callq	*%rbp
00000000000651f5	.byte 0xfe #bad opcode
00000000000651f6	.byte 0xff #bad opcode
00000000000651f7	callq	*%rbp
00000000000651f9	.byte 0xfe #bad opcode
00000000000651fa	.byte 0xff #bad opcode
00000000000651fb	callq	*%rbp
00000000000651fd	.byte 0xfe #bad opcode
00000000000651fe	.byte 0xff #bad opcode
00000000000651ff	callq	*%rbp
0000000000065201	.byte 0xfe #bad opcode
0000000000065202	.byte 0xff #bad opcode
0000000000065203	callq	*%rbp
0000000000065205	.byte 0xfe #bad opcode
0000000000065206	.byte 0xff #bad opcode
0000000000065207	decl	%ebp
0000000000065209	cld
000000000006520a	.byte 0xff #bad opcode
000000000006520b	decl	%ebp
000000000006520d	cld
000000000006520e	.byte 0xff #bad opcode
000000000006520f	decl	%ebp
0000000000065211	cld
0000000000065212	.byte 0xff #bad opcode
0000000000065213	decl	%ebp
0000000000065215	cld
0000000000065216	.byte 0xff #bad opcode
0000000000065217	pushq	%rsi
0000000000065219	cld
000000000006521a	.byte 0xff #bad opcode
000000000006521b	pushq	%rsi
000000000006521d	cld
000000000006521e	.byte 0xff #bad opcode
000000000006521f	pushq	%rsi
0000000000065221	cld
0000000000065222	.byte 0xff #bad opcode
0000000000065223	pushq	%rsi
0000000000065225	cld
0000000000065226	.byte 0xff #bad opcode
0000000000065227	callq	*%rbp
0000000000065229	.byte 0xfe #bad opcode
000000000006522a	.byte 0xff #bad opcode
000000000006522b	callq	*%rbp
000000000006522d	.byte 0xfe #bad opcode
000000000006522e	.byte 0xff #bad opcode
000000000006522f	callq	*%rbp
0000000000065231	.byte 0xfe #bad opcode
0000000000065232	.byte 0xff #bad opcode
0000000000065233	callq	*%rbp
0000000000065235	.byte 0xfe #bad opcode
0000000000065236	.byte 0xff #bad opcode
0000000000065237	callq	*%rbp
0000000000065239	.byte 0xfe #bad opcode
000000000006523a	.byte 0xff #bad opcode
000000000006523b	callq	*%rbp
000000000006523d	.byte 0xfe #bad opcode
000000000006523e	.byte 0xff #bad opcode
000000000006523f	callq	*%rbp
0000000000065241	.byte 0xfe #bad opcode
0000000000065242	.byte 0xff #bad opcode
0000000000065243	callq	*%rbp
0000000000065245	.byte 0xfe #bad opcode
0000000000065246	.byte 0xff #bad opcode
0000000000065247	callq	*(%rdx)
0000000000065249	.byte 0xfe #bad opcode
000000000006524a	.byte 0xff #bad opcode
000000000006524b	incl	-0x1(%rsi,%rdi,8)
000000000006524f	pushq	-0x2(%rbx)
0000000000065252	.byte 0xff #bad opcode
0000000000065253	lcalll	*-0x3(%rdi)
0000000000065256	.byte 0xff #bad opcode
0000000000065257	callq	*%rbp
0000000000065259	.byte 0xfe #bad opcode
000000000006525a	.byte 0xff #bad opcode
000000000006525b	callq	*%rbp
000000000006525d	.byte 0xfe #bad opcode
000000000006525e	.byte 0xff #bad opcode
000000000006525f	callq	*%rbp
0000000000065261	.byte 0xfe #bad opcode
0000000000065262	.byte 0xff #bad opcode
0000000000065263	callq	*%rbp
0000000000065265	.byte 0xfe #bad opcode
0000000000065266	.byte 0xff #bad opcode
0000000000065267	callq	*%rbp
0000000000065269	.byte 0xfe #bad opcode
000000000006526a	.byte 0xff #bad opcode
000000000006526b	callq	*%rbp
000000000006526d	.byte 0xfe #bad opcode
000000000006526e	.byte 0xff #bad opcode
000000000006526f	jmpq	*%rbx
0000000000065271	std
0000000000065272	.byte 0xff #bad opcode
0000000000065273	callq	*0x48(%rbp)
0000000000065276	movl	%esp, %ebp
0000000000065278	movb	$0x1, 0xb1(%rdi)
000000000006527f	popq	%rbp
0000000000065280	retq
0000000000065281	nop
