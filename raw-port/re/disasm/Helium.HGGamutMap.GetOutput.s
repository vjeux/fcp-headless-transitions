__ZN10HGGamutMap9GetOutputEP10HGRenderer:
0000000000157760	pushq	%rbp
0000000000157761	movq	%rsp, %rbp
0000000000157764	pushq	%r15
0000000000157766	pushq	%r14
0000000000157768	pushq	%r12
000000000015776a	pushq	%rbx
000000000015776b	subq	$0x10, %rsp
000000000015776f	movq	%rdi, %r14
0000000000157772	movq	%rsi, %rdi
0000000000157775	movq	%r14, %rsi
0000000000157778	xorl	%edx, %edx
000000000015777a	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000015777f	movq	%rax, %rbx
0000000000157782	cmpb	$0x1, 0x1d4(%r14)
000000000015778a	jne	0x1577cb
000000000015778c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000157791	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000157796	movq	%rax, %r15
0000000000157799	movq	%rax, %rdi
000000000015779c	callq	__ZN13HgcGamutDebugC1Ev         ## HgcGamutDebug::HgcGamutDebug()
00000000001577a1	movq	0x1c8(%r14), %rdi
00000000001577a8	cmpq	%r15, %rdi
00000000001577ab	je	0x15788e
00000000001577b1	testq	%rdi, %rdi
00000000001577b4	je	0x1577bc
00000000001577b6	movq	(%rdi), %rax
00000000001577b9	callq	*0x18(%rax)
00000000001577bc	movq	%r15, 0x1c8(%r14)
00000000001577c3	movq	%r15, %rdi
00000000001577c6	jmp	0x1578a3
00000000001577cb	movq	0x198(%r14), %rax
00000000001577d2	testq	%rax, %rax
00000000001577d5	je	0x1577ea
00000000001577d7	movq	0x1a0(%r14), %rcx
00000000001577de	testq	%rcx, %rcx
00000000001577e1	je	0x1577ea
00000000001577e3	cmpq	%rcx, %rax
00000000001577e6	jne	0x157812
00000000001577e8	jmp	0x157804
00000000001577ea	cmpl	$0x0, 0x1a8(%r14)
00000000001577f2	je	0x1578ba
00000000001577f8	movq	0x1a0(%r14), %rcx
00000000001577ff	cmpq	%rcx, %rax
0000000000157802	jne	0x157812
0000000000157804	cmpl	$0x0, 0x1a8(%r14)
000000000015780c	je	0x1578ba
0000000000157812	testq	%rbx, %rbx
0000000000157815	je	0x157820
0000000000157817	movq	(%rbx), %rax
000000000015781a	movq	%rbx, %rdi
000000000015781d	callq	*0x10(%rax)
0000000000157820	movl	$0x370, %edi                    ## imm = 0x370
0000000000157825	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000015782a	movq	%rax, %r15
000000000015782d	movq	%rax, %rdi
0000000000157830	callq	__ZN14HGColorConformC1Ev        ## HGColorConform::HGColorConform()
0000000000157835	movq	(%r15), %rax
0000000000157838	movq	%r15, %rdi
000000000015783b	xorl	%esi, %esi
000000000015783d	movq	%rbx, %rdx
0000000000157840	callq	*0x78(%rax)
0000000000157843	movl	0x1a8(%r14), %esi
000000000015784a	testl	%esi, %esi
000000000015784c	je	0x1578c2
000000000015784e	cmpl	$0x1, %esi
0000000000157851	jne	0x1578da
0000000000157857	movl	0x1b4(%r14), %edx
000000000015785e	movl	0x1bc(%r14), %ecx
0000000000157865	movl	0x1ac(%r14), %esi
000000000015786c	movl	0x1b0(%r14), %r8d
0000000000157873	movl	0x1b8(%r14), %r9d
000000000015787a	movl	0x1c0(%r14), %eax
0000000000157881	movl	%eax, (%rsp)
0000000000157884	movq	%r15, %rdi
0000000000157887	callq	__ZN14HGColorConform13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_ ## HGColorConform::SetConversion(HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients, HGColorGamma::hgColorGammaColorPrimaries, HGColorGamma::hgColorGammaTransferFunction, HGColorGamma::hgColorGammaMatrixCoefficients)
000000000015788c	jmp	0x1578e2
000000000015788e	testq	%r15, %r15
0000000000157891	je	0x1578a3
0000000000157893	movq	(%r15), %rax
0000000000157896	movq	%r15, %rdi
0000000000157899	callq	*0x18(%rax)
000000000015789c	movq	0x1c8(%r14), %rdi
00000000001578a3	movq	(%rdi), %rax
00000000001578a6	xorl	%esi, %esi
00000000001578a8	movq	%rbx, %rdx
00000000001578ab	callq	*0x78(%rax)
00000000001578ae	movq	0x1c8(%r14), %rax
00000000001578b5	jmp	0x15799c
00000000001578ba	movq	%rbx, %rax
00000000001578bd	jmp	0x15799c
00000000001578c2	movq	0x198(%r14), %rsi
00000000001578c9	movq	0x1a0(%r14), %rdx
00000000001578d0	movq	%r15, %rdi
00000000001578d3	callq	__ZN14HGColorConform13SetConversionEP12CGColorSpaceS1_ ## HGColorConform::SetConversion(CGColorSpace*, CGColorSpace*)
00000000001578d8	jmp	0x1578e2
00000000001578da	movq	%r15, %rdi
00000000001578dd	callq	__ZN14HGColorConform13SetConversionENS_30hgColorConformConversionPresetE ## HGColorConform::SetConversion(HGColorConform::hgColorConformConversionPreset)
00000000001578e2	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001578e7	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001578ec	movq	%rax, %r12
00000000001578ef	movq	%rax, %rdi
00000000001578f2	callq	__ZN11HgcGamutMapC1Ev           ## HgcGamutMap::HgcGamutMap()
00000000001578f7	movq	0x1c8(%r14), %rdi
00000000001578fe	cmpq	%r12, %rdi
0000000000157901	je	0x15791a
0000000000157903	testq	%rdi, %rdi
0000000000157906	je	0x15790e
0000000000157908	movq	(%rdi), %rax
000000000015790b	callq	*0x18(%rax)
000000000015790e	movq	%r12, 0x1c8(%r14)
0000000000157915	movq	%r12, %rdi
0000000000157918	jmp	0x157930
000000000015791a	testq	%r12, %r12
000000000015791d	je	0x157930
000000000015791f	movq	(%r12), %rax
0000000000157923	movq	%r12, %rdi
0000000000157926	callq	*0x18(%rax)
0000000000157929	movq	0x1c8(%r14), %rdi
0000000000157930	movq	(%rdi), %rax
0000000000157933	xorl	%esi, %esi
0000000000157935	movq	%r15, %rdx
0000000000157938	callq	*0x78(%rax)
000000000015793b	movq	0x1c8(%r14), %rdi
0000000000157942	movq	(%rdi), %rax
0000000000157945	movl	$0x1, %esi
000000000015794a	movq	%rbx, %rdx
000000000015794d	callq	*0x78(%rax)
0000000000157950	movq	0x1c8(%r14), %rdi
0000000000157957	movss	0x1d0(%r14), %xmm0
0000000000157960	movq	(%rdi), %rax
0000000000157963	movss	0x270355(%rip), %xmm3
000000000015796b	xorl	%esi, %esi
000000000015796d	movaps	%xmm0, %xmm1
0000000000157970	movaps	%xmm0, %xmm2
0000000000157973	callq	*0x60(%rax)
0000000000157976	movq	0x1c8(%r14), %r14
000000000015797d	movq	(%r15), %rax
0000000000157980	movq	%r15, %rdi
0000000000157983	callq	*0x18(%rax)
0000000000157986	testq	%rbx, %rbx
0000000000157989	je	0x157999
000000000015798b	movq	(%rbx), %rax
000000000015798e	movq	%rbx, %rdi
0000000000157991	callq	*0x18(%rax)
0000000000157994	movq	%r14, %rax
0000000000157997	jmp	0x15799c
0000000000157999	movq	%r14, %rax
000000000015799c	addq	$0x10, %rsp
00000000001579a0	popq	%rbx
00000000001579a1	popq	%r12
00000000001579a3	popq	%r14
00000000001579a5	popq	%r15
00000000001579a7	popq	%rbp
00000000001579a8	retq
00000000001579a9	movq	%rax, %rdi
00000000001579ac	callq	___clang_call_terminate
00000000001579b1	movq	%rax, %rdi
00000000001579b4	callq	___clang_call_terminate
00000000001579b9	movq	%rax, %r14
00000000001579bc	testq	%r12, %r12
00000000001579bf	je	0x157a37
00000000001579c1	movq	(%r12), %rax
00000000001579c5	movq	%r12, %rdi
00000000001579c8	callq	*0x18(%rax)
00000000001579cb	jmp	0x157a37
00000000001579cd	movq	%rax, %rdi
00000000001579d0	callq	___clang_call_terminate
00000000001579d5	movq	%rax, %r14
00000000001579d8	testq	%r15, %r15
00000000001579db	je	0x157a4e
00000000001579dd	movq	(%r15), %rax
00000000001579e0	movq	%r15, %rdi
00000000001579e3	callq	*0x18(%rax)
00000000001579e6	jmp	0x157a4e
00000000001579e8	movq	%rax, %rdi
00000000001579eb	callq	___clang_call_terminate
00000000001579f0	movq	%rax, %rdi
00000000001579f3	callq	___clang_call_terminate
00000000001579f8	movq	%rax, %rdi
00000000001579fb	callq	___clang_call_terminate
0000000000157a00	movq	%rax, %r14
0000000000157a03	movq	%r12, %rdi
0000000000157a06	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157a0b	jmp	0x157a37
0000000000157a0d	jmp	0x157a34
0000000000157a0f	movq	%rax, %r14
0000000000157a12	movq	%r15, %rdi
0000000000157a15	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157a1a	jmp	0x157a40
0000000000157a1c	movq	%rax, %r14
0000000000157a1f	jmp	0x157a40
0000000000157a21	movq	%rax, %r14
0000000000157a24	movq	%r15, %rdi
0000000000157a27	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157a2c	movq	%r14, %rdi
0000000000157a2f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157a34	movq	%rax, %r14
0000000000157a37	movq	(%r15), %rax
0000000000157a3a	movq	%r15, %rdi
0000000000157a3d	callq	*0x18(%rax)
0000000000157a40	testq	%rbx, %rbx
0000000000157a43	je	0x157a4e
0000000000157a45	movq	(%rbx), %rax
0000000000157a48	movq	%rbx, %rdi
0000000000157a4b	callq	*0x18(%rax)
0000000000157a4e	movq	%r14, %rdi
0000000000157a51	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157a56	movq	%rax, %rdi
0000000000157a59	callq	___clang_call_terminate
0000000000157a5e	movq	%rax, %rdi
0000000000157a61	callq	___clang_call_terminate
0000000000157a66	nopw	%cs:(%rax,%rax)
