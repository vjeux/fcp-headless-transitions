__ZN21OZChannelColorNoAlpha15setColorSpaceIDEN17PCColorSpaceCache2IDEb:
0000000000056c4a	pushq	%rbp
0000000000056c4b	movq	%rsp, %rbp
0000000000056c4e	pushq	%r15
0000000000056c50	pushq	%r14
0000000000056c52	pushq	%r13
0000000000056c54	pushq	%r12
0000000000056c56	pushq	%rbx
0000000000056c57	subq	$0xb8, %rsp
0000000000056c5e	movl	%edx, %r15d
0000000000056c61	movl	%esi, %ebx
0000000000056c63	movq	%rdi, %r14
0000000000056c66	leaq	0x2e8(%rdi), %r13
0000000000056c6d	movq	0x7384c(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056c74	xorps	%xmm0, %xmm0
0000000000056c77	movq	%r13, %rdi
0000000000056c7a	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000056c7f	movl	%eax, %edi
0000000000056c81	movl	$0x3, %esi
0000000000056c86	callq	0xacbd6                         ## symbol stub for: __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE
0000000000056c8b	cmpl	%ebx, %eax
0000000000056c8d	je	0x56ffc
0000000000056c93	cmpb	$0x1, 0x3e8(%r14)
0000000000056c9b	jne	0x56ffc
0000000000056ca1	leaq	0x88(%r14), %r12
0000000000056ca8	movq	%r12, %rdi
0000000000056cab	callq	__ZN9OZChannel31getNumberOfCurveProcessingNodesEv ## OZChannel::getNumberOfCurveProcessingNodes()
0000000000056cb0	movzbl	%r15b, %ecx
0000000000056cb4	movl	%ecx, -0x38(%rbp)
0000000000056cb7	testl	%eax, %eax
0000000000056cb9	jne	0x56fef
0000000000056cbf	leaq	0x120(%r14), %rdi
0000000000056cc6	movq	%rdi, -0x48(%rbp)
0000000000056cca	callq	__ZN9OZChannel31getNumberOfCurveProcessingNodesEv ## OZChannel::getNumberOfCurveProcessingNodes()
0000000000056ccf	testl	%eax, %eax
0000000000056cd1	jne	0x56fef
0000000000056cd7	leaq	0x1b8(%r14), %r15
0000000000056cde	movq	%r15, %rdi
0000000000056ce1	callq	__ZN9OZChannel31getNumberOfCurveProcessingNodesEv ## OZChannel::getNumberOfCurveProcessingNodes()
0000000000056ce6	testl	%eax, %eax
0000000000056ce8	jne	0x56fef
0000000000056cee	movq	0x737cb(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056cf5	xorps	%xmm0, %xmm0
0000000000056cf8	movq	%r13, %rdi
0000000000056cfb	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000056d00	movl	%eax, %edi
0000000000056d02	movl	$0x3, %esi
0000000000056d07	callq	0xacbd6                         ## symbol stub for: __ZN17PCColorSpaceCache17intToColorSpaceIDEiNS_2IDE
0000000000056d0c	movl	%eax, %edi
0000000000056d0e	callq	0xacbe2                         ## symbol stub for: __ZN17PCColorSpaceCache19getCGColorSpaceByIDENS_2IDE
0000000000056d13	movq	%rax, -0x58(%rbp)
0000000000056d17	movl	%ebx, %edi
0000000000056d19	callq	0xacbe2                         ## symbol stub for: __ZN17PCColorSpaceCache19getCGColorSpaceByIDENS_2IDE
0000000000056d1e	movq	%rax, %r13
0000000000056d21	movq	%r12, %rdi
0000000000056d24	callq	__ZNK9OZChannel15getDefaultValueEv ## OZChannel::getDefaultValue() const
0000000000056d29	cvtsd2ss	%xmm0, %xmm0
0000000000056d2d	movss	%xmm0, -0x40(%rbp)
0000000000056d32	movq	-0x48(%rbp), %rdi
0000000000056d36	callq	__ZNK9OZChannel15getDefaultValueEv ## OZChannel::getDefaultValue() const
0000000000056d3b	cvtsd2ss	%xmm0, %xmm0
0000000000056d3f	movss	%xmm0, -0x50(%rbp)
0000000000056d44	movq	%r15, %rdi
0000000000056d47	callq	__ZNK9OZChannel15getDefaultValueEv ## OZChannel::getDefaultValue() const
0000000000056d4c	cvtsd2ss	%xmm0, %xmm2
0000000000056d50	leaq	-0x34(%rbp), %rsi
0000000000056d54	leaq	-0x30(%rbp), %rdx
0000000000056d58	leaq	-0x2c(%rbp), %rcx
0000000000056d5c	movss	-0x40(%rbp), %xmm0
0000000000056d61	movss	-0x50(%rbp), %xmm1
0000000000056d66	movq	-0x58(%rbp), %rdi
0000000000056d6a	movq	%r13, -0x68(%rbp)
0000000000056d6e	movq	%r13, %r8
0000000000056d71	callq	__ZL12convertColorfffP12CGColorSpacePfS1_S1_S0_ ## convertColor(float, float, float, CGColorSpace*, float*, float*, float*, CGColorSpace*)
0000000000056d76	leaq	-0x34(%rbp), %rax
0000000000056d7a	xorps	%xmm0, %xmm0
0000000000056d7d	cvtss2sd	(%rax), %xmm0
0000000000056d81	movq	%r12, %rdi
0000000000056d84	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000056d89	leaq	-0x30(%rbp), %rax
0000000000056d8d	xorps	%xmm0, %xmm0
0000000000056d90	cvtss2sd	(%rax), %xmm0
0000000000056d94	movq	-0x48(%rbp), %rdi
0000000000056d98	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000056d9d	leaq	-0x2c(%rbp), %rax
0000000000056da1	xorps	%xmm0, %xmm0
0000000000056da4	cvtss2sd	(%rax), %xmm0
0000000000056da8	movq	%r15, -0x40(%rbp)
0000000000056dac	movq	%r15, %rdi
0000000000056daf	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000056db4	movq	0x736f5(%rip), %rax             ## literal pool symbol address: _kCMTimeNegativeInfinity
0000000000056dbb	movq	0x10(%rax), %rcx
0000000000056dbf	movq	%rcx, -0xa0(%rbp)
0000000000056dc6	movups	(%rax), %xmm0
0000000000056dc9	movaps	%xmm0, -0xb0(%rbp)
0000000000056dd0	movq	0x736e1(%rip), %rax             ## literal pool symbol address: _kCMTimePositiveInfinity
0000000000056dd7	movups	(%rax), %xmm0
0000000000056dda	movups	%xmm0, -0x98(%rbp)
0000000000056de1	movq	0x10(%rax), %rax
0000000000056de5	movq	%rax, -0x88(%rbp)
0000000000056dec	movq	(%r14), %rax
0000000000056def	movaps	-0xb0(%rbp), %xmm0
0000000000056df6	movaps	-0xa0(%rbp), %xmm1
0000000000056dfd	movaps	-0x90(%rbp), %xmm2
0000000000056e04	movups	%xmm2, 0x20(%rsp)
0000000000056e09	movups	%xmm1, 0x10(%rsp)
0000000000056e0e	movups	%xmm0, (%rsp)
0000000000056e12	leaq	-0x80(%rbp), %r15
0000000000056e16	movq	%r15, %rdi
0000000000056e19	movq	%r14, %rsi
0000000000056e1c	xorl	%edx, %edx
0000000000056e1e	xorl	%ecx, %ecx
0000000000056e20	callq	*0x208(%rax)
0000000000056e26	movq	(%r15), %r13
0000000000056e29	movq	0x8(%r15), %r15
0000000000056e2d	cmpq	%r15, %r13
0000000000056e30	je	0x56f33
0000000000056e36	movq	%r12, %rdi
0000000000056e39	movq	%r13, %rsi
0000000000056e3c	xorl	%edx, %edx
0000000000056e3e	callq	__ZNK9OZChannel13hasKeypointAtERK6CMTimej ## OZChannel::hasKeypointAt(CMTime const&, unsigned int) const
0000000000056e43	testb	%al, %al
0000000000056e45	je	0x56f21
0000000000056e4b	movq	-0x48(%rbp), %rdi
0000000000056e4f	movq	%r13, %rsi
0000000000056e52	xorl	%edx, %edx
0000000000056e54	callq	__ZNK9OZChannel13hasKeypointAtERK6CMTimej ## OZChannel::hasKeypointAt(CMTime const&, unsigned int) const
0000000000056e59	testb	%al, %al
0000000000056e5b	je	0x56f21
0000000000056e61	movq	-0x40(%rbp), %rdi
0000000000056e65	movq	%r13, %rsi
0000000000056e68	xorl	%edx, %edx
0000000000056e6a	callq	__ZNK9OZChannel13hasKeypointAtERK6CMTimej ## OZChannel::hasKeypointAt(CMTime const&, unsigned int) const
0000000000056e6f	testb	%al, %al
0000000000056e71	je	0x56f21
0000000000056e77	xorps	%xmm0, %xmm0
0000000000056e7a	movq	%r12, %rdi
0000000000056e7d	movq	%r13, %rsi
0000000000056e80	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056e85	movsd	%xmm0, -0x50(%rbp)
0000000000056e8a	xorps	%xmm0, %xmm0
0000000000056e8d	movq	-0x48(%rbp), %rdi
0000000000056e91	movq	%r13, %rsi
0000000000056e94	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056e99	movsd	%xmm0, -0x60(%rbp)
0000000000056e9e	xorps	%xmm0, %xmm0
0000000000056ea1	movq	-0x40(%rbp), %rdi
0000000000056ea5	movq	%r13, %rsi
0000000000056ea8	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056ead	cvtsd2ss	-0x50(%rbp), %xmm3
0000000000056eb2	xorps	%xmm1, %xmm1
0000000000056eb5	cvtsd2ss	-0x60(%rbp), %xmm1
0000000000056eba	xorps	%xmm2, %xmm2
0000000000056ebd	cvtsd2ss	%xmm0, %xmm2
0000000000056ec1	movaps	%xmm3, %xmm0
0000000000056ec4	movq	-0x58(%rbp), %rdi
0000000000056ec8	leaq	-0x34(%rbp), %rsi
0000000000056ecc	leaq	-0x30(%rbp), %rdx
0000000000056ed0	leaq	-0x2c(%rbp), %rcx
0000000000056ed4	movq	-0x68(%rbp), %r8
0000000000056ed8	callq	__ZL12convertColorfffP12CGColorSpacePfS1_S1_S0_ ## convertColor(float, float, float, CGColorSpace*, float*, float*, float*, CGColorSpace*)
0000000000056edd	xorps	%xmm0, %xmm0
0000000000056ee0	cvtss2sd	-0x34(%rbp), %xmm0
0000000000056ee5	movq	%r12, %rdi
0000000000056ee8	movq	%r13, %rsi
0000000000056eeb	movl	-0x38(%rbp), %edx
0000000000056eee	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
0000000000056ef3	xorps	%xmm0, %xmm0
0000000000056ef6	cvtss2sd	-0x30(%rbp), %xmm0
0000000000056efb	movq	-0x48(%rbp), %rdi
0000000000056eff	movq	%r13, %rsi
0000000000056f02	movl	-0x38(%rbp), %edx
0000000000056f05	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
0000000000056f0a	xorps	%xmm0, %xmm0
0000000000056f0d	cvtss2sd	-0x2c(%rbp), %xmm0
0000000000056f12	movq	-0x40(%rbp), %rdi
0000000000056f16	movq	%r13, %rsi
0000000000056f19	movl	-0x38(%rbp), %edx
0000000000056f1c	callq	__ZN9OZChannel8setValueERK6CMTimedb ## OZChannel::setValue(CMTime const&, double, bool)
0000000000056f21	addq	$0x18, %r13
0000000000056f25	cmpq	%r15, %r13
0000000000056f28	jne	0x56e36
0000000000056f2e	jmp	0x56fdd
0000000000056f33	movq	0x73586(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056f3a	xorps	%xmm0, %xmm0
0000000000056f3d	movq	%r12, %rdi
0000000000056f40	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056f45	movsd	%xmm0, -0x50(%rbp)
0000000000056f4a	movq	0x7356f(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056f51	xorps	%xmm0, %xmm0
0000000000056f54	movq	-0x48(%rbp), %rdi
0000000000056f58	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056f5d	movsd	%xmm0, -0x60(%rbp)
0000000000056f62	movq	0x73557(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000056f69	xorps	%xmm0, %xmm0
0000000000056f6c	movq	-0x40(%rbp), %rdi
0000000000056f70	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
0000000000056f75	cvtsd2ss	-0x50(%rbp), %xmm3
0000000000056f7a	xorps	%xmm1, %xmm1
0000000000056f7d	cvtsd2ss	-0x60(%rbp), %xmm1
0000000000056f82	xorps	%xmm2, %xmm2
0000000000056f85	cvtsd2ss	%xmm0, %xmm2
0000000000056f89	leaq	-0x34(%rbp), %rsi
0000000000056f8d	leaq	-0x30(%rbp), %rdx
0000000000056f91	leaq	-0x2c(%rbp), %rcx
0000000000056f95	movaps	%xmm3, %xmm0
0000000000056f98	movq	-0x58(%rbp), %rdi
0000000000056f9c	movq	-0x68(%rbp), %r8
0000000000056fa0	callq	__ZL12convertColorfffP12CGColorSpacePfS1_S1_S0_ ## convertColor(float, float, float, CGColorSpace*, float*, float*, float*, CGColorSpace*)
0000000000056fa5	xorps	%xmm0, %xmm0
0000000000056fa8	cvtss2sd	-0x34(%rbp), %xmm0
0000000000056fad	movq	%r12, %rdi
0000000000056fb0	xorl	%esi, %esi
0000000000056fb2	callq	__ZN9OZChannel15setInitialValueEdb ## OZChannel::setInitialValue(double, bool)
0000000000056fb7	xorps	%xmm0, %xmm0
0000000000056fba	cvtss2sd	-0x30(%rbp), %xmm0
0000000000056fbf	movq	-0x48(%rbp), %rdi
0000000000056fc3	xorl	%esi, %esi
0000000000056fc5	callq	__ZN9OZChannel15setInitialValueEdb ## OZChannel::setInitialValue(double, bool)
0000000000056fca	xorps	%xmm0, %xmm0
0000000000056fcd	cvtss2sd	-0x2c(%rbp), %xmm0
0000000000056fd2	movq	-0x40(%rbp), %rdi
0000000000056fd6	xorl	%esi, %esi
0000000000056fd8	callq	__ZN9OZChannel15setInitialValueEdb ## OZChannel::setInitialValue(double, bool)
0000000000056fdd	movq	-0x80(%rbp), %rdi
0000000000056fe1	testq	%rdi, %rdi
0000000000056fe4	je	0x56fef
0000000000056fe6	movq	%rdi, -0x78(%rbp)
0000000000056fea	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000056fef	movq	%r14, %rdi
0000000000056ff2	movl	%ebx, %esi
0000000000056ff4	movl	-0x38(%rbp), %edx
0000000000056ff7	callq	__ZN21OZChannelColorNoAlpha27setColorSpaceIDNoConversionEN17PCColorSpaceCache2IDEb ## OZChannelColorNoAlpha::setColorSpaceIDNoConversion(PCColorSpaceCache::ID, bool)
0000000000056ffc	addq	$0xb8, %rsp
0000000000057003	popq	%rbx
0000000000057004	popq	%r12
0000000000057006	popq	%r13
0000000000057008	popq	%r14
000000000005700a	popq	%r15
000000000005700c	popq	%rbp
000000000005700d	retq
000000000005700e	jmp	0x57010
0000000000057010	movq	%rax, %rbx
0000000000057013	movq	-0x80(%rbp), %rdi
0000000000057017	testq	%rdi, %rdi
000000000005701a	je	0x57025
000000000005701c	movq	%rdi, -0x78(%rbp)
0000000000057020	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000057025	movq	%rbx, %rdi
0000000000057028	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
