__ZN23OZSoftGradientGenerator9getHeliumER7LiAgentRK14OZRenderParams:
00000000004d7e20	pushq	%rbp
00000000004d7e21	movq	%rsp, %rbp
00000000004d7e24	pushq	%r15
00000000004d7e26	pushq	%r14
00000000004d7e28	pushq	%r13
00000000004d7e2a	pushq	%r12
00000000004d7e2c	pushq	%rbx
00000000004d7e2d	subq	$0x158, %rsp                    ## imm = 0x158
00000000004d7e34	movq	%rcx, %r14
00000000004d7e37	movq	%rdx, %r15
00000000004d7e3a	movq	%rsi, %r12
00000000004d7e3d	movq	%rdi, -0x48(%rbp)
00000000004d7e41	movq	0x10(%rcx), %rax
00000000004d7e45	movq	%rax, -0xb0(%rbp)
00000000004d7e4c	movupd	(%rcx), %xmm0
00000000004d7e50	movapd	%xmm0, -0xc0(%rbp)
00000000004d7e58	leaq	0x5038(%rsi), %rdi
00000000004d7e5f	leaq	-0xc0(%rbp), %r13
00000000004d7e66	xorpd	%xmm0, %xmm0
00000000004d7e6a	movq	%r13, %rsi
00000000004d7e6d	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004d7e72	movapd	%xmm0, -0x60(%rbp)
00000000004d7e77	leaq	-0x178(%rbp), %rbx
00000000004d7e7e	movq	%rbx, %rdi
00000000004d7e81	callq	0x6deeb0                        ## symbol stub for: __ZN7PCColorC1Ev
00000000004d7e86	addq	$0x4bb0, %r12                   ## imm = 0x4BB0
00000000004d7e8d	movq	%r12, %rdi
00000000004d7e90	movq	%r13, %rsi
00000000004d7e93	movq	%rbx, %rdx
00000000004d7e96	callq	0x6df5ee                        ## symbol stub for: __ZNK14OZChannelColor8getColorERK6CMTimeR7PCColor
00000000004d7e9b	movq	%r14, %rdi
00000000004d7e9e	callq	__ZNK14OZRenderParams20getWorkingColorSpaceEv ## OZRenderParams::getWorkingColorSpace() const
00000000004d7ea3	leaq	-0xa8(%rbp), %rdi
00000000004d7eaa	leaq	-0x178(%rbp), %rsi
00000000004d7eb1	movq	%rax, %rdx
00000000004d7eb4	callq	0x6ddde2                        ## symbol stub for: __ZN14PCWorkingColorC1ERK7PCColorP12CGColorSpace
00000000004d7eb9	leaq	-0x140(%rbp), %rdi
00000000004d7ec0	xorpd	%xmm0, %xmm0
00000000004d7ec4	movq	%r15, %rsi
00000000004d7ec7	callq	0x6df924                        ## symbol stub for: __ZNK7LiAgent24getInversePixelTransformEd
00000000004d7ecc	movl	$0x1b0, %edi                    ## imm = 0x1B0
00000000004d7ed1	callq	0x6def70                        ## symbol stub for: __ZN8HGObjectnwEm
00000000004d7ed6	movq	%rax, %r14
00000000004d7ed9	movq	%rax, %rdi
00000000004d7edc	callq	__ZN25OZHeSoftGradientGeneratorC1Ev ## OZHeSoftGradientGenerator::OZHeSoftGradientGenerator()
00000000004d7ee1	movsd	-0x140(%rbp), %xmm0
00000000004d7ee9	movsd	-0x138(%rbp), %xmm1
00000000004d7ef1	cvtsd2ss	%xmm0, %xmm0
00000000004d7ef5	cvtsd2ss	%xmm1, %xmm1
00000000004d7ef9	movsd	-0x128(%rbp), %xmm2
00000000004d7f01	cvtsd2ss	%xmm2, %xmm3
00000000004d7f05	movq	(%r14), %rax
00000000004d7f08	xorps	%xmm2, %xmm2
00000000004d7f0b	movq	%r14, %rdi
00000000004d7f0e	xorl	%esi, %esi
00000000004d7f10	callq	*0x60(%rax)
00000000004d7f13	movsd	-0x120(%rbp), %xmm0
00000000004d7f1b	movsd	-0x118(%rbp), %xmm1
00000000004d7f23	cvtsd2ss	%xmm0, %xmm0
00000000004d7f27	cvtsd2ss	%xmm1, %xmm1
00000000004d7f2b	movsd	-0x108(%rbp), %xmm2
00000000004d7f33	xorps	%xmm3, %xmm3
00000000004d7f36	cvtsd2ss	%xmm2, %xmm3
00000000004d7f3a	movq	(%r14), %rax
00000000004d7f3d	xorps	%xmm2, %xmm2
00000000004d7f40	movq	%r14, %rdi
00000000004d7f43	movl	$0x1, %esi
00000000004d7f48	callq	*0x60(%rax)
00000000004d7f4b	movsd	-0xe0(%rbp), %xmm0
00000000004d7f53	movsd	-0xd8(%rbp), %xmm1
00000000004d7f5b	cvtsd2ss	%xmm0, %xmm0
00000000004d7f5f	cvtsd2ss	%xmm1, %xmm1
00000000004d7f63	movsd	-0xc8(%rbp), %xmm2
00000000004d7f6b	xorps	%xmm3, %xmm3
00000000004d7f6e	cvtsd2ss	%xmm2, %xmm3
00000000004d7f72	movq	(%r14), %rax
00000000004d7f75	xorps	%xmm2, %xmm2
00000000004d7f78	movq	%r14, %rdi
00000000004d7f7b	movl	$0x2, %esi
00000000004d7f80	callq	*0x60(%rax)
00000000004d7f83	movss	-0xa8(%rbp), %xmm0
00000000004d7f8b	movss	-0xa4(%rbp), %xmm1
00000000004d7f93	movss	-0xa0(%rbp), %xmm2
00000000004d7f9b	movss	-0x9c(%rbp), %xmm3
00000000004d7fa3	movq	(%r14), %rax
00000000004d7fa6	movq	%r14, %rdi
00000000004d7fa9	movl	$0x3, %esi
00000000004d7fae	callq	*0x60(%rax)
00000000004d7fb1	movsd	0x22d427(%rip), %xmm0
00000000004d7fb9	divsd	-0x60(%rbp), %xmm0
00000000004d7fbe	cvtsd2ss	%xmm0, %xmm0
00000000004d7fc2	movq	(%r14), %rax
00000000004d7fc5	xorps	%xmm1, %xmm1
00000000004d7fc8	xorps	%xmm2, %xmm2
00000000004d7fcb	xorps	%xmm3, %xmm3
00000000004d7fce	movq	%r14, %rdi
00000000004d7fd1	movl	$0x4, %esi
00000000004d7fd6	callq	*0x60(%rax)
00000000004d7fd9	movapd	-0x60(%rbp), %xmm1
00000000004d7fde	movapd	%xmm1, %xmm0
00000000004d7fe2	addsd	%xmm1, %xmm0
00000000004d7fe6	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
00000000004d7fea	xorpd	0x22f56e(%rip), %xmm1
00000000004d7ff2	movapd	%xmm1, -0x80(%rbp)
00000000004d7ff7	movsd	%xmm0, -0x70(%rbp)
00000000004d7ffc	movsd	%xmm0, -0x68(%rbp)
00000000004d8001	movq	0xa0(%r15), %rdi
00000000004d8008	leaq	-0x80(%rbp), %rdx
00000000004d800c	movq	%rdx, %rsi
00000000004d800f	callq	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_ ## bool PCMatrix44Tmpl<double>::transformRect<double>(PCRect<double> const&, PCRect<double>&) const
00000000004d8014	testb	%al, %al
00000000004d8016	je	0x4d804c
00000000004d8018	movapd	-0x80(%rbp), %xmm1
00000000004d801d	movapd	0x22edfb(%rip), %xmm0
00000000004d8025	addpd	%xmm1, %xmm0
00000000004d8029	roundpd	$0x9, %xmm0, %xmm0
00000000004d802f	cvttpd2dq	%xmm0, %xmm0
00000000004d8033	addpd	-0x70(%rbp), %xmm1
00000000004d8038	roundpd	$0xa, %xmm1, %xmm1
00000000004d803e	cvttpd2dq	%xmm1, %xmm1
00000000004d8042	psubd	%xmm0, %xmm1
00000000004d8046	punpcklqdq	%xmm1, %xmm0            ## xmm0 = xmm0[0],xmm1[0]
00000000004d804a	jmp	0x4d8069
00000000004d804c	movq	%r15, %rdi
00000000004d804f	callq	0x6df960                        ## symbol stub for: __ZNK7LiAgent7haveROIEv
00000000004d8054	testb	%al, %al
00000000004d8056	je	0x4d809e
00000000004d8058	leaq	-0x40(%rbp), %rdi
00000000004d805c	movq	%r15, %rsi
00000000004d805f	callq	0x6df954                        ## symbol stub for: __ZNK7LiAgent6getROIEv
00000000004d8064	movdqa	-0x40(%rbp), %xmm0
00000000004d8069	movd	%xmm0, %edi
00000000004d806d	pextrd	$0x2, %xmm0, %edx
00000000004d8073	pextrd	$0x1, %xmm0, %esi
00000000004d8079	addl	%edi, %edx
00000000004d807b	pextrd	$0x3, %xmm0, %ecx
00000000004d8081	addl	%esi, %ecx
00000000004d8083	callq	0x6dcca8                        ## symbol stub for: _HGRectMake4i
00000000004d8088	movq	%rax, -0x40(%rbp)
00000000004d808c	movq	%rdx, -0x38(%rbp)
00000000004d8090	leaq	-0x40(%rbp), %rsi
00000000004d8094	movq	%r14, %rdi
00000000004d8097	callq	__ZN25OZHeSoftGradientGenerator6setDODERK6HGRect ## OZHeSoftGradientGenerator::setDOD(HGRect const&)
00000000004d809c	jmp	0x4d80ad
00000000004d809e	movq	0x348c4b(%rip), %rsi            ## literal pool symbol address: _HGRectInfinite
00000000004d80a5	movq	%r14, %rdi
00000000004d80a8	callq	__ZN25OZHeSoftGradientGenerator6setDODERK6HGRect ## OZHeSoftGradientGenerator::setDOD(HGRect const&)
00000000004d80ad	movq	-0x48(%rbp), %rbx
00000000004d80b1	movq	%r14, (%rbx)
00000000004d80b4	movq	-0x98(%rbp), %rdi
00000000004d80bb	testq	%rdi, %rdi
00000000004d80be	je	0x4d80c5
00000000004d80c0	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
00000000004d80c5	movq	-0x148(%rbp), %rdi
00000000004d80cc	testq	%rdi, %rdi
00000000004d80cf	je	0x4d80d6
00000000004d80d1	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
00000000004d80d6	movq	%rbx, %rax
00000000004d80d9	addq	$0x158, %rsp                    ## imm = 0x158
00000000004d80e0	popq	%rbx
00000000004d80e1	popq	%r12
00000000004d80e3	popq	%r13
00000000004d80e5	popq	%r14
00000000004d80e7	popq	%r15
00000000004d80e9	popq	%rbp
00000000004d80ea	retq
00000000004d80eb	jmp	0x4d8133
00000000004d80ed	movq	%rax, %rdi
00000000004d80f0	callq	___clang_call_terminate
00000000004d80f5	movq	%rax, %rdi
00000000004d80f8	callq	___clang_call_terminate
00000000004d80fd	jmp	0x4d8133
00000000004d80ff	jmp	0x4d8133
00000000004d8101	movq	%rax, %rbx
00000000004d8104	movq	%r14, %rdi
00000000004d8107	callq	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
00000000004d810c	jmp	0x4d813f
00000000004d810e	movq	%rax, %rbx
00000000004d8111	jmp	0x4d813f
00000000004d8113	movq	%rax, %rbx
00000000004d8116	jmp	0x4d813f
00000000004d8118	jmp	0x4d811c
00000000004d811a	jmp	0x4d8133
00000000004d811c	movq	%rax, %rbx
00000000004d811f	leaq	-0x178(%rbp), %rdi
00000000004d8126	callq	__ZN7PCColorD1Ev                ## PCColor::~PCColor()
00000000004d812b	movq	%rbx, %rdi
00000000004d812e	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004d8133	movq	%rax, %rbx
00000000004d8136	movq	(%r14), %rax
00000000004d8139	movq	%r14, %rdi
00000000004d813c	callq	*0x18(%rax)
00000000004d813f	leaq	-0xa8(%rbp), %rdi
00000000004d8146	callq	__ZN14PCWorkingColorD1Ev        ## PCWorkingColor::~PCWorkingColor()
00000000004d814b	leaq	-0x178(%rbp), %rdi
00000000004d8152	callq	__ZN7PCColorD1Ev                ## PCColor::~PCColor()
00000000004d8157	movq	%rbx, %rdi
00000000004d815a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004d815f	movq	%rax, %rdi
00000000004d8162	callq	___clang_call_terminate
00000000004d8167	nopw	(%rax,%rax)
