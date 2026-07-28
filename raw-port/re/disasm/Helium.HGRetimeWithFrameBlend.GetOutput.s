__ZN22HGRetimeWithFrameBlend9GetOutputEP10HGRenderer:
00000000001e39b0	pushq	%rbp
00000000001e39b1	movq	%rsp, %rbp
00000000001e39b4	pushq	%r15
00000000001e39b6	pushq	%r14
00000000001e39b8	pushq	%r12
00000000001e39ba	pushq	%rbx
00000000001e39bb	movq	%rsi, %r14
00000000001e39be	movq	%rdi, %rbx
00000000001e39c1	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001e39c6	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001e39cb	movq	%rax, %r15
00000000001e39ce	movq	%rax, %rdi
00000000001e39d1	callq	__ZN23HgcRetimeWithFrameBlendC1Ev ## HgcRetimeWithFrameBlend::HgcRetimeWithFrameBlend()
00000000001e39d6	movq	0x1a0(%rbx), %r12
00000000001e39dd	cmpq	%r15, %r12
00000000001e39e0	je	0x1e39fd
00000000001e39e2	testq	%r12, %r12
00000000001e39e5	je	0x1e39f1
00000000001e39e7	movq	(%r12), %rax
00000000001e39eb	movq	%r12, %rdi
00000000001e39ee	callq	*0x18(%rax)
00000000001e39f1	movq	%r15, 0x1a0(%rbx)
00000000001e39f8	movq	%r15, %r12
00000000001e39fb	jmp	0x1e3a12
00000000001e39fd	testq	%r15, %r15
00000000001e3a00	je	0x1e3a12
00000000001e3a02	movq	(%r15), %rax
00000000001e3a05	movq	%r15, %rdi
00000000001e3a08	callq	*0x18(%rax)
00000000001e3a0b	movq	0x1a0(%rbx), %r12
00000000001e3a12	movq	%r14, %rdi
00000000001e3a15	movq	%rbx, %rsi
00000000001e3a18	xorl	%edx, %edx
00000000001e3a1a	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001e3a1f	movq	(%r12), %rcx
00000000001e3a23	movq	%r12, %rdi
00000000001e3a26	xorl	%esi, %esi
00000000001e3a28	movq	%rax, %rdx
00000000001e3a2b	callq	*0x78(%rcx)
00000000001e3a2e	movq	0x1a0(%rbx), %r15
00000000001e3a35	movq	%r14, %rdi
00000000001e3a38	movq	%rbx, %rsi
00000000001e3a3b	movl	$0x1, %edx
00000000001e3a40	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001e3a45	movq	(%r15), %rcx
00000000001e3a48	movq	%r15, %rdi
00000000001e3a4b	movl	$0x1, %esi
00000000001e3a50	movq	%rax, %rdx
00000000001e3a53	callq	*0x78(%rcx)
00000000001e3a56	movq	0x1a0(%rbx), %rdi
00000000001e3a5d	movss	0x198(%rbx), %xmm0
00000000001e3a65	movq	(%rdi), %rax
00000000001e3a68	xorps	%xmm1, %xmm1
00000000001e3a6b	xorps	%xmm2, %xmm2
00000000001e3a6e	xorps	%xmm3, %xmm3
00000000001e3a71	xorl	%esi, %esi
00000000001e3a73	callq	*0x60(%rax)
00000000001e3a76	movq	0x1a0(%rbx), %rax
00000000001e3a7d	popq	%rbx
00000000001e3a7e	popq	%r12
00000000001e3a80	popq	%r14
00000000001e3a82	popq	%r15
00000000001e3a84	popq	%rbp
00000000001e3a85	retq
00000000001e3a86	movq	%rax, %rdi
00000000001e3a89	callq	___clang_call_terminate
00000000001e3a8e	movq	%rax, %rbx
00000000001e3a91	testq	%r15, %r15
00000000001e3a94	je	0x1e3ab4
00000000001e3a96	movq	(%r15), %rax
00000000001e3a99	movq	%r15, %rdi
00000000001e3a9c	callq	*0x18(%rax)
00000000001e3a9f	jmp	0x1e3ab4
00000000001e3aa1	movq	%rax, %rdi
00000000001e3aa4	callq	___clang_call_terminate
00000000001e3aa9	movq	%rax, %rbx
00000000001e3aac	movq	%r15, %rdi
00000000001e3aaf	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001e3ab4	movq	%rbx, %rdi
00000000001e3ab7	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001e3abc	nopl	(%rax)
