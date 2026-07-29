__ZN17OZImageMaskRender23calculateBackProjectionEPK8LiCameraRK13OZRenderStateP14PCMatrix44TmplIdE:
000000000046e7e0	pushq	%rbp
000000000046e7e1	movq	%rsp, %rbp
000000000046e7e4	pushq	%r15
000000000046e7e6	pushq	%r14
000000000046e7e8	pushq	%r13
000000000046e7ea	pushq	%r12
000000000046e7ec	pushq	%rbx
000000000046e7ed	subq	$0x288, %rsp                    ## imm = 0x288
000000000046e7f4	movq	0x5d8(%rdi), %rax
000000000046e7fb	movq	0x3b8(%rax), %rdi
000000000046e802	testq	%rdi, %rdi
000000000046e805	je	0x46e8ea
000000000046e80b	movq	%rcx, %rbx
000000000046e80e	movq	%rdx, %r15
000000000046e811	movq	%rsi, %r13
000000000046e814	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
000000000046e81b	leaq	__ZTI9OZElement(%rip), %rdx     ## typeinfo for OZElement
000000000046e822	xorl	%r12d, %r12d
000000000046e825	xorl	%ecx, %ecx
000000000046e827	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000046e82c	testq	%rax, %rax
000000000046e82f	je	0x46e8ed
000000000046e835	movq	%rax, %r14
000000000046e838	leaq	-0x2b0(%rbp), %r12
000000000046e83f	movq	%r12, %rdi
000000000046e842	movq	%r15, %rsi
000000000046e845	callq	__ZN13OZRenderStateC1ERKS_      ## OZRenderState::OZRenderState(OZRenderState const&)
000000000046e84a	movq	%r12, %rdi
000000000046e84d	movq	%r13, %r15
000000000046e850	movq	%r13, %rsi
000000000046e853	callq	__ZN13OZRenderState12setEyeMatrixEPK8LiCamera ## OZRenderState::setEyeMatrix(LiCamera const*)
000000000046e858	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
000000000046e862	movq	%rax, -0x30(%rbp)
000000000046e866	movq	%rax, -0x58(%rbp)
000000000046e86a	movq	%rax, -0x80(%rbp)
000000000046e86e	movq	%rax, -0xa8(%rbp)
000000000046e875	xorps	%xmm0, %xmm0
000000000046e878	movups	%xmm0, -0xa0(%rbp)
000000000046e87f	movups	%xmm0, -0x90(%rbp)
000000000046e886	movups	%xmm0, -0x78(%rbp)
000000000046e88a	movups	%xmm0, -0x68(%rbp)
000000000046e88e	movups	%xmm0, -0x50(%rbp)
000000000046e892	movups	%xmm0, -0x40(%rbp)
000000000046e896	movq	(%r14), %rax
000000000046e899	leaq	-0xa8(%rbp), %r13
000000000046e8a0	movq	%r14, %rdi
000000000046e8a3	movq	%r13, %rsi
000000000046e8a6	movq	%r12, %rdx
000000000046e8a9	callq	*0x500(%rax)
000000000046e8af	movq	(%r15), %rax
000000000046e8b2	leaq	-0x128(%rbp), %r14
000000000046e8b9	movq	%r14, %rdi
000000000046e8bc	movq	%r15, %rsi
000000000046e8bf	callq	*0x30(%rax)
000000000046e8c2	leaq	-0x1a8(%rbp), %r15
000000000046e8c9	movq	%r15, %rdi
000000000046e8cc	movq	%r14, %rsi
000000000046e8cf	movq	%r13, %rdx
000000000046e8d2	callq	__ZNK14PCMatrix44TmplIdEmlERKS0_ ## PCMatrix44Tmpl<double>::operator*(PCMatrix44Tmpl<double> const&) const
000000000046e8d7	xorps	%xmm0, %xmm0
000000000046e8da	movq	%rbx, %rdi
000000000046e8dd	movq	%r15, %rsi
000000000046e8e0	callq	__ZN14PCMatrix44TmplIdE14planarInverseZERKS0_d ## PCMatrix44Tmpl<double>::planarInverseZ(PCMatrix44Tmpl<double> const&, double)
000000000046e8e5	movl	%eax, %r12d
000000000046e8e8	jmp	0x46e8ed
000000000046e8ea	xorl	%r12d, %r12d
000000000046e8ed	movl	%r12d, %eax
000000000046e8f0	addq	$0x288, %rsp                    ## imm = 0x288
000000000046e8f7	popq	%rbx
000000000046e8f8	popq	%r12
000000000046e8fa	popq	%r13
000000000046e8fc	popq	%r14
000000000046e8fe	popq	%r15
000000000046e900	popq	%rbp
000000000046e901	retq
000000000046e902	nopw	%cs:(%rax,%rax)
