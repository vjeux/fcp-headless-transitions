__ZN11HGARRILogC46Encode9GetOutputEP10HGRenderer:
0000000000102dc0	pushq	%rbp
0000000000102dc1	movq	%rsp, %rbp
0000000000102dc4	pushq	%r14
0000000000102dc6	pushq	%rbx
0000000000102dc7	movq	%rdi, %rbx
0000000000102dca	movq	0x198(%rdi), %r14
0000000000102dd1	movq	%rsi, %rdi
0000000000102dd4	movq	%rbx, %rsi
0000000000102dd7	xorl	%edx, %edx
0000000000102dd9	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000102dde	movq	(%r14), %rcx
0000000000102de1	movq	%r14, %rdi
0000000000102de4	xorl	%esi, %esi
0000000000102de6	movq	%rax, %rdx
0000000000102de9	callq	*0x78(%rcx)
0000000000102dec	movq	0x198(%rbx), %rdi
0000000000102df3	movq	0x1a8(%rbx), %rsi
0000000000102dfa	movl	$0x1, %edx
0000000000102dff	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000102e04	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE1s(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::s
0000000000102e0b	testb	%al, %al
0000000000102e0d	je	0x102ecd
0000000000102e13	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE1t(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::t
0000000000102e1a	testb	%al, %al
0000000000102e1c	je	0x102ee1
0000000000102e22	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2ep(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::ep
0000000000102e29	testb	%al, %al
0000000000102e2b	je	0x102ef5
0000000000102e31	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2fp(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::fp
0000000000102e38	testb	%al, %al
0000000000102e3a	je	0x102f09
0000000000102e40	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2tp(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::tp
0000000000102e47	testb	%al, %al
0000000000102e49	je	0x102f1d
0000000000102e4f	movq	0x198(%rbx), %rdx
0000000000102e56	movq	0x1a0(%rbx), %rdi
0000000000102e5d	movq	(%rdi), %rax
0000000000102e60	xorl	%esi, %esi
0000000000102e62	callq	*0x78(%rax)
0000000000102e65	movq	0x1a0(%rbx), %rdi
0000000000102e6c	movq	(%rdi), %rax
0000000000102e6f	movss	0x2ce149(%rip), %xmm0
0000000000102e77	movss	0x2ce145(%rip), %xmm1
0000000000102e7f	movss	0x2ce141(%rip), %xmm2
0000000000102e87	movss	0x2ce13d(%rip), %xmm3
0000000000102e8f	xorl	%esi, %esi
0000000000102e91	callq	*0x60(%rax)
0000000000102e94	movq	0x1a0(%rbx), %rdi
0000000000102e9b	movss	__ZZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2ep(%rip), %xmm0 ## HGARRILogC4::Encode::GetOutput(HGRenderer*)::ep
0000000000102ea3	movss	__ZZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2fp(%rip), %xmm1 ## HGARRILogC4::Encode::GetOutput(HGRenderer*)::fp
0000000000102eab	movss	__ZZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2tp(%rip), %xmm2 ## HGARRILogC4::Encode::GetOutput(HGRenderer*)::tp
0000000000102eb3	movq	(%rdi), %rax
0000000000102eb6	xorps	%xmm3, %xmm3
0000000000102eb9	movl	$0x1, %esi
0000000000102ebe	callq	*0x60(%rax)
0000000000102ec1	movq	0x1a0(%rbx), %rax
0000000000102ec8	popq	%rbx
0000000000102ec9	popq	%r14
0000000000102ecb	popq	%rbp
0000000000102ecc	retq
0000000000102ecd	callq	__ZN11HGARRILogC46Encode9GetOutputEP10HGRenderer.cold.1 ## HGARRILogC4::Encode::GetOutput(HGRenderer*) (.cold.1)
0000000000102ed2	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE1t(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::t
0000000000102ed9	testb	%al, %al
0000000000102edb	jne	0x102e22
0000000000102ee1	callq	__ZN11HGARRILogC46Encode9GetOutputEP10HGRenderer.cold.2 ## HGARRILogC4::Encode::GetOutput(HGRenderer*) (.cold.2)
0000000000102ee6	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2ep(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::ep
0000000000102eed	testb	%al, %al
0000000000102eef	jne	0x102e31
0000000000102ef5	callq	__ZN11HGARRILogC46Encode9GetOutputEP10HGRenderer.cold.3 ## HGARRILogC4::Encode::GetOutput(HGRenderer*) (.cold.3)
0000000000102efa	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2fp(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::fp
0000000000102f01	testb	%al, %al
0000000000102f03	jne	0x102e40
0000000000102f09	callq	__ZN11HGARRILogC46Encode9GetOutputEP10HGRenderer.cold.4 ## HGARRILogC4::Encode::GetOutput(HGRenderer*) (.cold.4)
0000000000102f0e	movzbl	__ZGVZN11HGARRILogC46Encode9GetOutputEP10HGRendererE2tp(%rip), %eax ## guard variable for HGARRILogC4::Encode::GetOutput(HGRenderer*)::tp
0000000000102f15	testb	%al, %al
0000000000102f17	jne	0x102e4f
0000000000102f1d	callq	__ZN11HGARRILogC46Encode9GetOutputEP10HGRenderer.cold.5 ## HGARRILogC4::Encode::GetOutput(HGRenderer*) (.cold.5)
0000000000102f22	jmp	0x102e4f
0000000000102f27	nopw	(%rax,%rax)
