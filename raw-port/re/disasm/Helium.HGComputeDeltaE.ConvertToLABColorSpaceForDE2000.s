__ZN15HGComputeDeltaE31ConvertToLABColorSpaceForDE2000ERK5HGRefI6HGNodeE:
00000000000939b0	pushq	%rbp
00000000000939b1	movq	%rsp, %rbp
00000000000939b4	pushq	%r15
00000000000939b6	pushq	%r14
00000000000939b8	pushq	%r12
00000000000939ba	pushq	%rbx
00000000000939bb	movq	%rdx, %r15
00000000000939be	movq	%rdi, %r14
00000000000939c1	movl	0x19c(%rsi), %eax
00000000000939c7	leal	-0x1(%rax), %ecx
00000000000939ca	cmpl	$0x3, %ecx
00000000000939cd	jae	0x93a4a
00000000000939cf	movq	%rsi, %r12
00000000000939d2	movl	$0x1e0, %edi                    ## imm = 0x1E0
00000000000939d7	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000939dc	movq	%rax, %rbx
00000000000939df	movq	%rax, %rdi
00000000000939e2	callq	__ZN11HGToneCurveC1Ev           ## HGToneCurve::HGToneCurve()
00000000000939e7	movl	0x19c(%r12), %eax
00000000000939ef	cmpl	$0x3, %eax
00000000000939f2	movl	$0x1, %ecx
00000000000939f7	movl	$0x7, %edx
00000000000939fc	cmovel	%ecx, %edx
00000000000939ff	cmpl	$0x1, %eax
0000000000093a02	movl	$0x5, %esi
0000000000093a07	cmovnel	%edx, %esi
0000000000093a0a	movq	%rbx, %rdi
0000000000093a0d	callq	__ZN11HGToneCurve19SetAcceleratedStateENS_27hgToneCurveAcceleratedStateE ## HGToneCurve::SetAcceleratedState(HGToneCurve::hgToneCurveAcceleratedState)
0000000000093a12	movq	%rbx, %rdi
0000000000093a15	movl	$0x7, %esi
0000000000093a1a	callq	__ZN11HGToneCurve19SetToneCurveQualityENS_18hgToneCurveQualityE ## HGToneCurve::SetToneCurveQuality(HGToneCurve::hgToneCurveQuality)
0000000000093a1f	movq	(%r15), %rdx
0000000000093a22	movq	(%rbx), %rax
0000000000093a25	xorl	%r15d, %r15d
0000000000093a28	movq	%rbx, %rdi
0000000000093a2b	xorl	%esi, %esi
0000000000093a2d	callq	*0x78(%rax)
0000000000093a30	movq	(%rbx), %rax
0000000000093a33	movq	%rbx, %r15
0000000000093a36	movq	%rbx, %rdi
0000000000093a39	callq	*0x10(%rax)
0000000000093a3c	movq	(%rbx), %rax
0000000000093a3f	movq	%rbx, %rdi
0000000000093a42	callq	*0x18(%rax)
0000000000093a45	jmp	0x93ae2
0000000000093a4a	testl	%eax, %eax
0000000000093a4c	jne	0x93abd
0000000000093a4e	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000093a53	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000093a58	movq	%rax, %rbx
0000000000093a5b	movq	%rax, %rdi
0000000000093a5e	callq	__ZN12HGColorClampC1Ev          ## HGColorClamp::HGColorClamp()
0000000000093a63	movss	0x334265(%rip), %xmm0
0000000000093a6b	movq	%rbx, %rdi
0000000000093a6e	movaps	%xmm0, %xmm1
0000000000093a71	movaps	%xmm0, %xmm2
0000000000093a74	movaps	%xmm0, %xmm3
0000000000093a77	callq	__ZN12HGColorClamp17SetClampMaxValuesEffff ## HGColorClamp::SetClampMaxValues(float, float, float, float)
0000000000093a7c	movss	0x339778(%rip), %xmm0
0000000000093a84	movq	%rbx, %rdi
0000000000093a87	movaps	%xmm0, %xmm1
0000000000093a8a	movaps	%xmm0, %xmm2
0000000000093a8d	movaps	%xmm0, %xmm3
0000000000093a90	callq	__ZN12HGColorClamp17SetClampMinValuesEffff ## HGColorClamp::SetClampMinValues(float, float, float, float)
0000000000093a95	movq	(%r15), %rdx
0000000000093a98	movq	(%rbx), %rax
0000000000093a9b	xorl	%r15d, %r15d
0000000000093a9e	movq	%rbx, %rdi
0000000000093aa1	xorl	%esi, %esi
0000000000093aa3	callq	*0x78(%rax)
0000000000093aa6	movq	(%rbx), %rax
0000000000093aa9	movq	%rbx, %r15
0000000000093aac	movq	%rbx, %rdi
0000000000093aaf	callq	*0x10(%rax)
0000000000093ab2	movq	(%rbx), %rax
0000000000093ab5	movq	%rbx, %rdi
0000000000093ab8	callq	*0x18(%rax)
0000000000093abb	jmp	0x93ae2
0000000000093abd	xorl	%ebx, %ebx
0000000000093abf	leaq	0x848090(%rip), %rdi            ## literal pool for: "Unexpected Colorspace/Colorspace conversion needs implementation"
0000000000093ac6	xorl	%eax, %eax
0000000000093ac8	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
0000000000093acd	movq	(%r15), %rbx
0000000000093ad0	testq	%rbx, %rbx
0000000000093ad3	je	0x93ae0
0000000000093ad5	movq	(%rbx), %rax
0000000000093ad8	movq	%rbx, %rdi
0000000000093adb	callq	*0x10(%rax)
0000000000093ade	jmp	0x93ae2
0000000000093ae0	xorl	%ebx, %ebx
0000000000093ae2	movl	$0x1f0, %edi                    ## imm = 0x1F0
0000000000093ae7	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000093aec	movq	%rax, %r15
0000000000093aef	movq	%rax, %rdi
0000000000093af2	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
0000000000093af7	leaq	__ZN13HGColorMatrix9sRGBtoXYZE(%rip), %rsi ## HGColorMatrix::sRGBtoXYZ
0000000000093afe	movq	%r15, %rdi
0000000000093b01	xorl	%edx, %edx
0000000000093b03	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000093b08	movq	(%r15), %rax
0000000000093b0b	movq	%r15, %rdi
0000000000093b0e	xorl	%esi, %esi
0000000000093b10	movq	%rbx, %rdx
0000000000093b13	callq	*0x78(%rax)
0000000000093b16	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000093b1b	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000093b20	movq	%rax, %r12
0000000000093b23	movq	%rax, %rdi
0000000000093b26	callq	__ZN11HgcXYZtoLABC1Ev           ## HgcXYZtoLAB::HgcXYZtoLAB()
0000000000093b2b	movq	%r12, (%r14)
0000000000093b2e	movq	(%r12), %rax
0000000000093b32	movss	0x3396c6(%rip), %xmm1
0000000000093b3a	movss	0x33417e(%rip), %xmm0
0000000000093b42	movss	0x3396ba(%rip), %xmm3
0000000000093b4a	movq	%r12, %rdi
0000000000093b4d	xorl	%esi, %esi
0000000000093b4f	movaps	%xmm0, %xmm2
0000000000093b52	callq	*0x60(%rax)
0000000000093b55	movq	(%r12), %rax
0000000000093b59	movq	%r12, %rdi
0000000000093b5c	xorl	%esi, %esi
0000000000093b5e	movq	%r15, %rdx
0000000000093b61	callq	*0x78(%rax)
0000000000093b64	movq	(%r15), %rax
0000000000093b67	movq	%r15, %rdi
0000000000093b6a	callq	*0x18(%rax)
0000000000093b6d	testq	%rbx, %rbx
0000000000093b70	je	0x93b7b
0000000000093b72	movq	(%rbx), %rax
0000000000093b75	movq	%rbx, %rdi
0000000000093b78	callq	*0x18(%rax)
0000000000093b7b	movq	%r14, %rax
0000000000093b7e	popq	%rbx
0000000000093b7f	popq	%r12
0000000000093b81	popq	%r14
0000000000093b83	popq	%r15
0000000000093b85	popq	%rbp
0000000000093b86	retq
0000000000093b87	movq	%rax, %rdi
0000000000093b8a	callq	___clang_call_terminate
0000000000093b8f	jmp	0x93bcb
0000000000093b91	jmp	0x93c19
0000000000093b96	movq	%rax, %r14
0000000000093b99	jmp	0x93baa
0000000000093b9b	movq	%rax, %r14
0000000000093b9e	testq	%rbx, %rbx
0000000000093ba1	je	0x93c68
0000000000093ba7	xorl	%r15d, %r15d
0000000000093baa	movq	(%rbx), %rax
0000000000093bad	movq	%rbx, %rdi
0000000000093bb0	callq	*0x18(%rax)
0000000000093bb3	movq	%r15, %rbx
0000000000093bb6	jmp	0x93c5a
0000000000093bbb	movq	%rax, %rdi
0000000000093bbe	callq	___clang_call_terminate
0000000000093bc3	movq	%rax, %rdi
0000000000093bc6	callq	___clang_call_terminate
0000000000093bcb	movq	%rax, %r14
0000000000093bce	movq	%rbx, %rdi
0000000000093bd1	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000093bd6	movq	%r14, %rdi
0000000000093bd9	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000093bde	movq	%rax, %rdi
0000000000093be1	callq	___clang_call_terminate
0000000000093be6	movq	%rax, %rdi
0000000000093be9	callq	___clang_call_terminate
0000000000093bee	movq	%rax, %r14
0000000000093bf1	movq	%r12, %rdi
0000000000093bf4	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000093bf9	jmp	0x93c51
0000000000093bfb	jmp	0x93bfd
0000000000093bfd	movq	%rax, %r14
0000000000093c00	jmp	0x93c51
0000000000093c02	movq	%rax, %r14
0000000000093c05	testq	%r15, %r15
0000000000093c08	jne	0x93c51
0000000000093c0a	jmp	0x93c5a
0000000000093c0c	movq	%rax, %r14
0000000000093c0f	movq	%r15, %rdi
0000000000093c12	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000093c17	jmp	0x93c5a
0000000000093c19	movq	%rax, %r14
0000000000093c1c	jmp	0x93c5a
0000000000093c1e	movq	%rax, %r14
0000000000093c21	jmp	0x93c2e
0000000000093c23	movq	%rax, %r14
0000000000093c26	testq	%rbx, %rbx
0000000000093c29	je	0x93c68
0000000000093c2b	xorl	%r15d, %r15d
0000000000093c2e	movq	(%rbx), %rax
0000000000093c31	movq	%rbx, %rdi
0000000000093c34	callq	*0x18(%rax)
0000000000093c37	movq	%r15, %rbx
0000000000093c3a	jmp	0x93c5a
0000000000093c3c	movq	%rax, %rdi
0000000000093c3f	callq	___clang_call_terminate
0000000000093c44	movq	%rax, %r14
0000000000093c47	movq	(%r12), %rax
0000000000093c4b	movq	%r12, %rdi
0000000000093c4e	callq	*0x18(%rax)
0000000000093c51	movq	(%r15), %rax
0000000000093c54	movq	%r15, %rdi
0000000000093c57	callq	*0x18(%rax)
0000000000093c5a	testq	%rbx, %rbx
0000000000093c5d	je	0x93c68
0000000000093c5f	movq	(%rbx), %rax
0000000000093c62	movq	%rbx, %rdi
0000000000093c65	callq	*0x18(%rax)
0000000000093c68	movq	%r14, %rdi
0000000000093c6b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000093c70	movq	%rax, %rdi
0000000000093c73	callq	___clang_call_terminate
0000000000093c78	movq	%rax, %rdi
0000000000093c7b	callq	___clang_call_terminate
0000000000093c80	movq	%rax, %rdi
0000000000093c83	callq	___clang_call_terminate
0000000000093c88	nopl	(%rax,%rax)
