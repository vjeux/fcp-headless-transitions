__ZN9HGLensGDC9GetOutputEP10HGRenderer:
00000000001e3190	pushq	%rbp
00000000001e3191	movq	%rsp, %rbp
00000000001e3194	pushq	%r15
00000000001e3196	pushq	%r14
00000000001e3198	pushq	%rbx
00000000001e3199	subq	$0x58, %rsp
00000000001e319d	movq	%rsi, %r14
00000000001e31a0	movq	%rdi, %rbx
00000000001e31a3	movq	%rsi, %rdi
00000000001e31a6	movq	%rbx, %rsi
00000000001e31a9	xorl	%edx, %edx
00000000001e31ab	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001e31b0	testq	%rax, %rax
00000000001e31b3	je	0x1e3271
00000000001e31b9	movq	%rax, %r15
00000000001e31bc	movq	(%r14), %rax
00000000001e31bf	movq	%r14, %rdi
00000000001e31c2	callq	*0x130(%rax)
00000000001e31c8	testb	%al, %al
00000000001e31ca	jne	0x1e335e
00000000001e31d0	leaq	0x1a8(%rbx), %rax
00000000001e31d7	cmpl	$0x1, 0x198(%rbx)
00000000001e31de	jne	0x1e3278
00000000001e31e4	movsd	0x19c(%rbx), %xmm0
00000000001e31ec	movsd	%xmm0, -0x70(%rbp)
00000000001e31f1	movss	0x1a4(%rbx), %xmm0
00000000001e31f9	movss	%xmm0, -0x68(%rbp)
00000000001e31fe	movups	(%rax), %xmm0
00000000001e3201	movups	0x10(%rax), %xmm1
00000000001e3205	movups	0x20(%rax), %xmm2
00000000001e3209	movups	0x2c(%rax), %xmm3
00000000001e320d	movups	%xmm0, -0x64(%rbp)
00000000001e3211	movups	%xmm1, -0x54(%rbp)
00000000001e3215	movups	%xmm2, -0x44(%rbp)
00000000001e3219	movups	%xmm3, -0x38(%rbp)
00000000001e321d	movsd	0x1e4(%rbx), %xmm0
00000000001e3225	movsd	%xmm0, -0x28(%rbp)
00000000001e322a	movzbl	0x1ec(%rbx), %eax
00000000001e3231	movb	%al, -0x20(%rbp)
00000000001e3234	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000001e3239	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001e323e	movq	%rax, %r14
00000000001e3241	movl	$0x1f0, %esi                    ## imm = 0x1F0
00000000001e3246	movq	%rax, %rdi
00000000001e3249	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000001e324e	movq	%r14, %rdi
00000000001e3251	callq	__ZN14Hgc2LensGDC_BLC2Ev        ## Hgc2LensGDC_BL::Hgc2LensGDC_BL()
00000000001e3256	leaq	0x847ebb(%rip), %rax
00000000001e325d	movq	%rax, (%r14)
00000000001e3260	leaq	-0x70(%rbp), %rsi
00000000001e3264	movq	%r14, %rdi
00000000001e3267	callq	__ZN14Hgc2LensGDC_BL13SetParametersERKNS_23LensGDCShaderParametersE ## Hgc2LensGDC_BL::SetParameters(Hgc2LensGDC_BL::LensGDCShaderParameters const&)
00000000001e326c	jmp	0x1e3300
00000000001e3271	xorl	%ebx, %ebx
00000000001e3273	jmp	0x1e335e
00000000001e3278	movsd	0x19c(%rbx), %xmm0
00000000001e3280	movsd	%xmm0, -0x70(%rbp)
00000000001e3285	movss	0x1a4(%rbx), %xmm0
00000000001e328d	movss	%xmm0, -0x68(%rbp)
00000000001e3292	movups	(%rax), %xmm0
00000000001e3295	movups	0x10(%rax), %xmm1
00000000001e3299	movups	0x20(%rax), %xmm2
00000000001e329d	movups	0x2c(%rax), %xmm3
00000000001e32a1	movups	%xmm0, -0x64(%rbp)
00000000001e32a5	movups	%xmm1, -0x54(%rbp)
00000000001e32a9	movups	%xmm2, -0x44(%rbp)
00000000001e32ad	movups	%xmm3, -0x38(%rbp)
00000000001e32b1	movsd	0x1e4(%rbx), %xmm0
00000000001e32b9	movsd	%xmm0, -0x28(%rbp)
00000000001e32be	movzbl	0x1ec(%rbx), %eax
00000000001e32c5	movb	%al, -0x20(%rbp)
00000000001e32c8	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000001e32cd	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001e32d2	movq	%rax, %r14
00000000001e32d5	movl	$0x1f0, %esi                    ## imm = 0x1F0
00000000001e32da	movq	%rax, %rdi
00000000001e32dd	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000001e32e2	movq	%r14, %rdi
00000000001e32e5	callq	__ZN14Hgc2LensGDC_BCC2Ev        ## Hgc2LensGDC_BC::Hgc2LensGDC_BC()
00000000001e32ea	leaq	0x84807f(%rip), %rax
00000000001e32f1	movq	%rax, (%r14)
00000000001e32f4	leaq	-0x70(%rbp), %rsi
00000000001e32f8	movq	%r14, %rdi
00000000001e32fb	callq	__ZN14Hgc2LensGDC_BC13SetParametersERKNS_23LensGDCShaderParametersE ## Hgc2LensGDC_BC::SetParameters(Hgc2LensGDC_BC::LensGDCShaderParameters const&)
00000000001e3300	movq	(%r14), %rax
00000000001e3303	movq	%r14, %rdi
00000000001e3306	xorl	%esi, %esi
00000000001e3308	movl	$0x2002, %edx                   ## imm = 0x2002
00000000001e330d	callq	*0x88(%rax)
00000000001e3313	movq	(%r14), %rax
00000000001e3316	movq	%r14, %rdi
00000000001e3319	xorl	%esi, %esi
00000000001e331b	movq	%r15, %rdx
00000000001e331e	callq	*0x78(%rax)
00000000001e3321	movq	0x1f0(%rbx), %r15
00000000001e3328	cmpq	%r14, %r15
00000000001e332b	je	0x1e3352
00000000001e332d	testq	%r15, %r15
00000000001e3330	je	0x1e333b
00000000001e3332	movq	(%r15), %rax
00000000001e3335	movq	%r15, %rdi
00000000001e3338	callq	*0x18(%rax)
00000000001e333b	movq	%r14, 0x1f0(%rbx)
00000000001e3342	movq	(%r14), %rax
00000000001e3345	movq	%r14, %rdi
00000000001e3348	callq	*0x10(%rax)
00000000001e334b	movq	0x1f0(%rbx), %r15
00000000001e3352	movq	(%r14), %rax
00000000001e3355	movq	%r14, %rdi
00000000001e3358	callq	*0x18(%rax)
00000000001e335b	movq	%r15, %rbx
00000000001e335e	movq	%rbx, %rax
00000000001e3361	addq	$0x58, %rsp
00000000001e3365	popq	%rbx
00000000001e3366	popq	%r14
00000000001e3368	popq	%r15
00000000001e336a	popq	%rbp
00000000001e336b	retq
00000000001e336c	jmp	0x1e336e
00000000001e336e	movq	%rax, %rbx
00000000001e3371	movq	%r14, %rdi
00000000001e3374	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001e3379	movq	%rbx, %rdi
00000000001e337c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001e3381	movq	%rax, %rdi
00000000001e3384	callq	___clang_call_terminate
00000000001e3389	movq	%rax, %rbx
00000000001e338c	movq	(%r14), %rax
00000000001e338f	movq	%r14, %rdi
00000000001e3392	callq	*0x18(%rax)
00000000001e3395	movq	%rbx, %rdi
00000000001e3398	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001e339d	movq	%rax, %rdi
00000000001e33a0	callq	___clang_call_terminate
00000000001e33a5	nopw	%cs:(%rax,%rax)
