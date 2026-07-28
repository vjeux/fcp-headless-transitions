__ZN10HGExposure9GetOutputEP10HGRenderer:
00000000001a90e0	pushq	%rbp
00000000001a90e1	movq	%rsp, %rbp
00000000001a90e4	pushq	%r15
00000000001a90e6	pushq	%r14
00000000001a90e8	pushq	%rbx
00000000001a90e9	pushq	%rax
00000000001a90ea	movq	%rdi, %rbx
00000000001a90ed	movq	%rsi, %rdi
00000000001a90f0	movq	%rbx, %rsi
00000000001a90f3	xorl	%edx, %edx
00000000001a90f5	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001a90fa	movq	%rax, %r15
00000000001a90fd	movaps	0x200(%rbx), %xmm0
00000000001a9104	ucomiss	0x21ebb5(%rip), %xmm0
00000000001a910b	jne	0x1a9135
00000000001a910d	jp	0x1a9135
00000000001a910f	movshdup	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1,3,3]
00000000001a9113	ucomiss	0x21eba6(%rip), %xmm0
00000000001a911a	jne	0x1a9135
00000000001a911c	jp	0x1a9135
00000000001a911e	movss	0x208(%rbx), %xmm0
00000000001a9126	ucomiss	0x21eb93(%rip), %xmm0
00000000001a912d	jne	0x1a9135
00000000001a912f	jnp	0x1a9214
00000000001a9135	movl	$0x220, %edi                    ## imm = 0x220
00000000001a913a	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001a913f	movq	%rax, %r14
00000000001a9142	movl	$0x220, %esi                    ## imm = 0x220
00000000001a9147	movq	%rax, %rdi
00000000001a914a	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000001a914f	movq	%r14, %rdi
00000000001a9152	callq	__ZN11HgcExposureC2Ev           ## HgcExposure::HgcExposure()
00000000001a9157	leaq	0x87ca52(%rip), %rax
00000000001a915e	movq	%rax, (%r14)
00000000001a9161	xorps	%xmm0, %xmm0
00000000001a9164	movups	%xmm0, 0x200(%r14)
00000000001a916c	movq	$0x0, 0x210(%r14)
00000000001a9177	movq	0x1f0(%rbx), %rdi
00000000001a917e	cmpq	%r14, %rdi
00000000001a9181	je	0x1a91a5
00000000001a9183	testq	%rdi, %rdi
00000000001a9186	je	0x1a9191
00000000001a9188	movq	(%rdi), %rax
00000000001a918b	callq	*0x18(%rax)
00000000001a918e	movq	(%r14), %rax
00000000001a9191	movq	%r14, 0x1f0(%rbx)
00000000001a9198	movq	%r14, %rdi
00000000001a919b	callq	*0x10(%rax)
00000000001a919e	movq	0x1f0(%rbx), %rdi
00000000001a91a5	movq	(%rdi), %rax
00000000001a91a8	xorl	%esi, %esi
00000000001a91aa	movq	%r15, %rdx
00000000001a91ad	callq	*0x78(%rax)
00000000001a91b0	movq	0x1f0(%rbx), %rdi
00000000001a91b7	movaps	0x200(%rbx), %xmm0
00000000001a91be	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000001a91c2	movss	0x208(%rbx), %xmm2
00000000001a91ca	movaps	%xmm0, %xmm3
00000000001a91cd	shufps	$0xff, %xmm0, %xmm3             ## xmm3 = xmm3[3,3],xmm0[3,3]
00000000001a91d1	movq	(%rdi), %rax
00000000001a91d4	xorl	%esi, %esi
00000000001a91d6	callq	*0x60(%rax)
00000000001a91d9	movq	0x1f0(%rbx), %rdi
00000000001a91e0	callq	__ZN13HGColorMatrix12LoadIdentityEv ## HGColorMatrix::LoadIdentity()
00000000001a91e5	movq	0x1f0(%rbx), %rdi
00000000001a91ec	movaps	0x200(%rbx), %xmm0
00000000001a91f3	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000001a91f7	movss	0x208(%rbx), %xmm2
00000000001a91ff	callq	__ZN13HGColorMatrix5ScaleEfff   ## HGColorMatrix::Scale(float, float, float)
00000000001a9204	movq	0x1f0(%rbx), %r15
00000000001a920b	movq	(%r14), %rax
00000000001a920e	movq	%r14, %rdi
00000000001a9211	callq	*0x18(%rax)
00000000001a9214	movq	%r15, %rax
00000000001a9217	addq	$0x8, %rsp
00000000001a921b	popq	%rbx
00000000001a921c	popq	%r14
00000000001a921e	popq	%r15
00000000001a9220	popq	%rbp
00000000001a9221	retq
00000000001a9222	movq	%rax, %rdi
00000000001a9225	callq	___clang_call_terminate
00000000001a922a	movq	%rax, %rbx
00000000001a922d	movq	%r14, %rdi
00000000001a9230	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001a9235	movq	%rbx, %rdi
00000000001a9238	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001a923d	movq	%rax, %rbx
00000000001a9240	movq	(%r14), %rax
00000000001a9243	movq	%r14, %rdi
00000000001a9246	callq	*0x18(%rax)
00000000001a9249	movq	%rbx, %rdi
00000000001a924c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001a9251	movq	%rax, %rdi
00000000001a9254	callq	___clang_call_terminate
00000000001a9259	nopl	(%rax)
