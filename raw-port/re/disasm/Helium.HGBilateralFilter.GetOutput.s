__ZN17HGBilateralFilter9GetOutputEP10HGRenderer:
00000000001c8ad0	pushq	%rbp
00000000001c8ad1	movq	%rsp, %rbp
00000000001c8ad4	pushq	%r15
00000000001c8ad6	pushq	%r14
00000000001c8ad8	pushq	%rbx
00000000001c8ad9	pushq	%rax
00000000001c8ada	movq	%rdi, %r14
00000000001c8add	movq	%rsi, %rdi
00000000001c8ae0	movq	%r14, %rsi
00000000001c8ae3	xorl	%edx, %edx
00000000001c8ae5	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001c8aea	movq	%rax, %rbx
00000000001c8aed	movss	0x1a8(%r14), %xmm0
00000000001c8af6	xorps	%xmm1, %xmm1
00000000001c8af9	ucomiss	%xmm1, %xmm0
00000000001c8afc	jne	0x1c8b04
00000000001c8afe	jnp	0x1c8c4e
00000000001c8b04	movq	0x1a0(%r14), %rdi
00000000001c8b0b	testq	%rdi, %rdi
00000000001c8b0e	jne	0x1c8b5d
00000000001c8b10	movl	$0x200, %edi                    ## imm = 0x200
00000000001c8b15	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001c8b1a	movq	%rax, %r15
00000000001c8b1d	movq	%rax, %rdi
00000000001c8b20	callq	__ZN27HGBilateralFilterKernelNodeC1Ev ## HGBilateralFilterKernelNode::HGBilateralFilterKernelNode()
00000000001c8b25	movq	0x1a0(%r14), %rdi
00000000001c8b2c	cmpq	%r15, %rdi
00000000001c8b2f	je	0x1c8b48
00000000001c8b31	testq	%rdi, %rdi
00000000001c8b34	je	0x1c8b3c
00000000001c8b36	movq	(%rdi), %rax
00000000001c8b39	callq	*0x18(%rax)
00000000001c8b3c	movq	%r15, 0x1a0(%r14)
00000000001c8b43	movq	%r15, %rdi
00000000001c8b46	jmp	0x1c8b5d
00000000001c8b48	testq	%r15, %r15
00000000001c8b4b	je	0x1c8b5d
00000000001c8b4d	movq	(%r15), %rax
00000000001c8b50	movq	%r15, %rdi
00000000001c8b53	callq	*0x18(%rax)
00000000001c8b56	movq	0x1a0(%r14), %rdi
00000000001c8b5d	movq	(%rdi), %rax
00000000001c8b60	xorl	%esi, %esi
00000000001c8b62	movq	%rbx, %rdx
00000000001c8b65	callq	*0x78(%rax)
00000000001c8b68	movq	0x1a0(%r14), %rbx
00000000001c8b6f	movss	0x1a8(%r14), %xmm0
00000000001c8b78	movss	0x1ac(%r14), %xmm1
00000000001c8b81	movss	0x1b0(%r14), %xmm2
00000000001c8b8a	xorps	%xmm3, %xmm3
00000000001c8b8d	ucomiss	%xmm3, %xmm2
00000000001c8b90	jbe	0x1c8baf
00000000001c8b92	mulss	%xmm0, %xmm2
00000000001c8b96	cvtss2sd	%xmm2, %xmm2
00000000001c8b9a	divsd	0x2041ae(%rip), %xmm2
00000000001c8ba2	roundsd	$0xa, %xmm2, %xmm2
00000000001c8ba8	cvttsd2si	%xmm2, %r15d
00000000001c8bad	jmp	0x1c8bc1
00000000001c8baf	roundss	$0xa, %xmm2, %xmm2
00000000001c8bb5	xorps	0x201514(%rip), %xmm2
00000000001c8bbc	cvttss2si	%xmm2, %r15d
00000000001c8bc1	cvtss2sd	%xmm1, %xmm1
00000000001c8bc5	movsd	0x204573(%rip), %xmm2
00000000001c8bcd	movaps	%xmm1, %xmm3
00000000001c8bd0	mulsd	%xmm2, %xmm3
00000000001c8bd4	mulsd	%xmm1, %xmm3
00000000001c8bd8	movsd	0x204178(%rip), %xmm1
00000000001c8be0	movapd	%xmm1, %xmm4
00000000001c8be4	divsd	%xmm3, %xmm4
00000000001c8be8	xorps	%xmm3, %xmm3
00000000001c8beb	cvtsd2ss	%xmm4, %xmm3
00000000001c8bef	movss	%xmm3, -0x1c(%rbp)
00000000001c8bf4	cvtss2sd	%xmm0, %xmm0
00000000001c8bf8	mulsd	%xmm0, %xmm2
00000000001c8bfc	mulsd	%xmm0, %xmm2
00000000001c8c00	divsd	%xmm2, %xmm1
00000000001c8c04	xorps	%xmm0, %xmm0
00000000001c8c07	cvtsd2ss	%xmm1, %xmm0
00000000001c8c0b	movq	(%rbx), %rax
00000000001c8c0e	xorps	%xmm3, %xmm3
00000000001c8c11	movq	%rbx, %rdi
00000000001c8c14	xorl	%esi, %esi
00000000001c8c16	movaps	%xmm0, %xmm1
00000000001c8c19	movaps	%xmm0, %xmm2
00000000001c8c1c	callq	*0x60(%rax)
00000000001c8c1f	movq	0x1a0(%r14), %rdi
00000000001c8c26	movq	(%rdi), %rax
00000000001c8c29	xorps	%xmm3, %xmm3
00000000001c8c2c	movl	$0x1, %esi
00000000001c8c31	movss	-0x1c(%rbp), %xmm0
00000000001c8c36	movaps	%xmm0, %xmm1
00000000001c8c39	movaps	%xmm0, %xmm2
00000000001c8c3c	callq	*0x60(%rax)
00000000001c8c3f	movq	0x1a0(%r14), %rdi
00000000001c8c46	movl	%r15d, %esi
00000000001c8c49	callq	__ZN27HGBilateralFilterKernelNode13SetWindowSizeEi ## HGBilateralFilterKernelNode::SetWindowSize(int)
00000000001c8c4e	movq	%rbx, %rax
00000000001c8c51	addq	$0x8, %rsp
00000000001c8c55	popq	%rbx
00000000001c8c56	popq	%r14
00000000001c8c58	popq	%r15
00000000001c8c5a	popq	%rbp
00000000001c8c5b	retq
00000000001c8c5c	movq	%rax, %rdi
00000000001c8c5f	callq	___clang_call_terminate
00000000001c8c64	movq	%rax, %rbx
00000000001c8c67	testq	%r15, %r15
00000000001c8c6a	je	0x1c8c8a
00000000001c8c6c	movq	(%r15), %rax
00000000001c8c6f	movq	%r15, %rdi
00000000001c8c72	callq	*0x18(%rax)
00000000001c8c75	jmp	0x1c8c8a
00000000001c8c77	movq	%rax, %rdi
00000000001c8c7a	callq	___clang_call_terminate
00000000001c8c7f	movq	%rax, %rbx
00000000001c8c82	movq	%r15, %rdi
00000000001c8c85	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c8c8a	movq	%rbx, %rdi
00000000001c8c8d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c8c92	nopw	%cs:(%rax,%rax)
