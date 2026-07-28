__ZN20HGYUV444ToPlanarLuma9GetOutputEP10HGRenderer:
00000000000e5bb0	pushq	%rbp
00000000000e5bb1	movq	%rsp, %rbp
00000000000e5bb4	pushq	%r15
00000000000e5bb6	pushq	%r14
00000000000e5bb8	pushq	%r12
00000000000e5bba	pushq	%rbx
00000000000e5bbb	movq	%rsi, %r15
00000000000e5bbe	movq	%rdi, %r14
00000000000e5bc1	movl	0x1a0(%rdi), %r12d
00000000000e5bc8	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000e5bcd	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e5bd2	movq	%rax, %rbx
00000000000e5bd5	cmpl	$0x1, %r12d
00000000000e5bd9	je	0xe5c05
00000000000e5bdb	testl	%r12d, %r12d
00000000000e5bde	jne	0xe5c26
00000000000e5be0	movq	%rbx, %rdi
00000000000e5be3	callq	__ZN28HgcYUV420BiPlanar_luma_pack4C1Ev ## HgcYUV420BiPlanar_luma_pack4::HgcYUV420BiPlanar_luma_pack4()
00000000000e5be8	movq	0x198(%r14), %rdi
00000000000e5bef	cmpq	%rbx, %rdi
00000000000e5bf2	je	0xe5c7e
00000000000e5bf8	testq	%rdi, %rdi
00000000000e5bfb	je	0xe5c45
00000000000e5bfd	movq	(%rdi), %rax
00000000000e5c00	callq	*0x18(%rax)
00000000000e5c03	jmp	0xe5c45
00000000000e5c05	movq	%rbx, %rdi
00000000000e5c08	callq	__ZN28HgcYUV420BiPlanar_luma_pack2C1Ev ## HgcYUV420BiPlanar_luma_pack2::HgcYUV420BiPlanar_luma_pack2()
00000000000e5c0d	movq	0x198(%r14), %rdi
00000000000e5c14	cmpq	%rbx, %rdi
00000000000e5c17	je	0xe5c8e
00000000000e5c19	testq	%rdi, %rdi
00000000000e5c1c	je	0xe5c45
00000000000e5c1e	movq	(%rdi), %rax
00000000000e5c21	callq	*0x18(%rax)
00000000000e5c24	jmp	0xe5c45
00000000000e5c26	movq	%rbx, %rdi
00000000000e5c29	callq	__ZN22HgcYUV420BiPlanar_lumaC1Ev ## HgcYUV420BiPlanar_luma::HgcYUV420BiPlanar_luma()
00000000000e5c2e	movq	0x198(%r14), %rdi
00000000000e5c35	cmpq	%rbx, %rdi
00000000000e5c38	je	0xe5c9e
00000000000e5c3a	testq	%rdi, %rdi
00000000000e5c3d	je	0xe5c45
00000000000e5c3f	movq	(%rdi), %rax
00000000000e5c42	callq	*0x18(%rax)
00000000000e5c45	movq	%rbx, 0x198(%r14)
00000000000e5c4c	movq	0x198(%r14), %rbx
00000000000e5c53	movq	%r15, %rdi
00000000000e5c56	movq	%r14, %rsi
00000000000e5c59	xorl	%edx, %edx
00000000000e5c5b	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000e5c60	movq	(%rbx), %rcx
00000000000e5c63	movq	%rbx, %rdi
00000000000e5c66	xorl	%esi, %esi
00000000000e5c68	movq	%rax, %rdx
00000000000e5c6b	callq	*0x78(%rcx)
00000000000e5c6e	movq	0x198(%r14), %rax
00000000000e5c75	popq	%rbx
00000000000e5c76	popq	%r12
00000000000e5c78	popq	%r14
00000000000e5c7a	popq	%r15
00000000000e5c7c	popq	%rbp
00000000000e5c7d	retq
00000000000e5c7e	testq	%rbx, %rbx
00000000000e5c81	je	0xe5c4c
00000000000e5c83	movq	(%rbx), %rax
00000000000e5c86	movq	%rbx, %rdi
00000000000e5c89	callq	*0x18(%rax)
00000000000e5c8c	jmp	0xe5c4c
00000000000e5c8e	testq	%rbx, %rbx
00000000000e5c91	je	0xe5c4c
00000000000e5c93	movq	(%rbx), %rax
00000000000e5c96	movq	%rbx, %rdi
00000000000e5c99	callq	*0x18(%rax)
00000000000e5c9c	jmp	0xe5c4c
00000000000e5c9e	testq	%rbx, %rbx
00000000000e5ca1	je	0xe5c4c
00000000000e5ca3	movq	(%rbx), %rax
00000000000e5ca6	movq	%rbx, %rdi
00000000000e5ca9	callq	*0x18(%rax)
00000000000e5cac	jmp	0xe5c4c
00000000000e5cae	movq	%rax, %rdi
00000000000e5cb1	callq	___clang_call_terminate
00000000000e5cb6	movq	%rax, %rdi
00000000000e5cb9	callq	___clang_call_terminate
00000000000e5cbe	movq	%rax, %rdi
00000000000e5cc1	callq	___clang_call_terminate
00000000000e5cc6	movq	%rax, %r14
00000000000e5cc9	testq	%rbx, %rbx
00000000000e5ccc	je	0xe5d26
00000000000e5cce	movq	(%rbx), %rax
00000000000e5cd1	movq	%rbx, %rdi
00000000000e5cd4	callq	*0x18(%rax)
00000000000e5cd7	jmp	0xe5d26
00000000000e5cd9	movq	%rax, %rdi
00000000000e5cdc	callq	___clang_call_terminate
00000000000e5ce1	movq	%rax, %r14
00000000000e5ce4	testq	%rbx, %rbx
00000000000e5ce7	je	0xe5d26
00000000000e5ce9	movq	(%rbx), %rax
00000000000e5cec	movq	%rbx, %rdi
00000000000e5cef	callq	*0x18(%rax)
00000000000e5cf2	jmp	0xe5d26
00000000000e5cf4	movq	%rax, %rdi
00000000000e5cf7	callq	___clang_call_terminate
00000000000e5cfc	movq	%rax, %r14
00000000000e5cff	testq	%rbx, %rbx
00000000000e5d02	je	0xe5d26
00000000000e5d04	movq	(%rbx), %rax
00000000000e5d07	movq	%rbx, %rdi
00000000000e5d0a	callq	*0x18(%rax)
00000000000e5d0d	jmp	0xe5d26
00000000000e5d0f	movq	%rax, %rdi
00000000000e5d12	callq	___clang_call_terminate
00000000000e5d17	jmp	0xe5d1b
00000000000e5d19	jmp	0xe5d1b
00000000000e5d1b	movq	%rax, %r14
00000000000e5d1e	movq	%rbx, %rdi
00000000000e5d21	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e5d26	movq	%r14, %rdi
00000000000e5d29	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000e5d2e	nop
