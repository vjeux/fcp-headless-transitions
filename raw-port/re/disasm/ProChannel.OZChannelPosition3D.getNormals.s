__ZN19OZChannelPosition3D10getNormalsERK6CMTimePdS3_S3_:
000000000007b028	movq	%rdx, %rax
000000000007b02b	orq	%rcx, %rax
000000000007b02e	orq	%r8, %rax
000000000007b031	je	0x7b271
000000000007b037	pushq	%rbp
000000000007b038	movq	%rsp, %rbp
000000000007b03b	pushq	%r15
000000000007b03d	pushq	%r14
000000000007b03f	pushq	%r13
000000000007b041	pushq	%r12
000000000007b043	pushq	%rbx
000000000007b044	subq	$0xc8, %rsp
000000000007b04b	movq	%rsi, %r13
000000000007b04e	movq	%rdi, %r12
000000000007b051	movq	%rdx, -0x30(%rbp)
000000000007b055	movq	%rcx, -0x78(%rbp)
000000000007b059	movq	%r8, -0x80(%rbp)
000000000007b05d	leaq	-0xa8(%rbp), %rbx
000000000007b064	movl	$0x1, %esi
000000000007b069	movq	%rbx, %rdi
000000000007b06c	movl	$0x32, %edx
000000000007b071	callq	0xaca92                         ## symbol stub for: _CMTimeMake
000000000007b076	movq	0x10(%r13), %rax
000000000007b07a	movq	%rax, -0x40(%rbp)
000000000007b07e	movups	(%r13), %xmm0
000000000007b083	movaps	%xmm0, -0x50(%rbp)
000000000007b087	movq	0x10(%rbx), %rax
000000000007b08b	movq	%rax, 0x28(%rsp)
000000000007b090	movups	(%rbx), %xmm0
000000000007b093	movups	%xmm0, 0x18(%rsp)
000000000007b098	movq	-0x40(%rbp), %rax
000000000007b09c	movq	%rax, 0x10(%rsp)
000000000007b0a1	movaps	-0x50(%rbp), %xmm0
000000000007b0a5	movups	%xmm0, (%rsp)
000000000007b0a9	leaq	-0xc0(%rbp), %r15
000000000007b0b0	movq	%r15, %rdi
000000000007b0b3	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000007b0b8	leaq	0x88(%r12), %rbx
000000000007b0c0	xorps	%xmm0, %xmm0
000000000007b0c3	movq	%rbx, %rdi
000000000007b0c6	movq	%r15, %rsi
000000000007b0c9	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000007b0ce	movsd	%xmm0, -0x70(%rbp)
000000000007b0d3	leaq	0x120(%r12), %r14
000000000007b0db	xorps	%xmm0, %xmm0
000000000007b0de	movq	%r14, %rdi
000000000007b0e1	movq	%r15, %rsi
000000000007b0e4	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000007b0e9	movsd	%xmm0, -0x68(%rbp)
000000000007b0ee	addq	$0x2e0, %r12                    ## imm = 0x2E0
000000000007b0f5	xorps	%xmm0, %xmm0
000000000007b0f8	movq	%r12, %rdi
000000000007b0fb	movq	%r15, %rsi
000000000007b0fe	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000007b103	movsd	%xmm0, -0x60(%rbp)
000000000007b108	leaq	-0xa8(%rbp), %r15
000000000007b10f	movl	$0x1, %esi
000000000007b114	movq	%r15, %rdi
000000000007b117	movl	$0x32, %edx
000000000007b11c	callq	0xaca92                         ## symbol stub for: _CMTimeMake
000000000007b121	movq	0x10(%r13), %rax
000000000007b125	movq	%rax, -0x40(%rbp)
000000000007b129	movups	(%r13), %xmm0
000000000007b12e	movaps	%xmm0, -0x50(%rbp)
000000000007b132	movq	0x10(%r15), %rax
000000000007b136	movq	%rax, 0x28(%rsp)
000000000007b13b	movups	(%r15), %xmm0
000000000007b13f	movups	%xmm0, 0x18(%rsp)
000000000007b144	movq	-0x40(%rbp), %rax
000000000007b148	movq	%rax, 0x10(%rsp)
000000000007b14d	movapd	-0x50(%rbp), %xmm0
000000000007b152	movupd	%xmm0, (%rsp)
000000000007b157	leaq	-0xc0(%rbp), %r15
000000000007b15e	movq	%r15, %rdi
000000000007b161	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000007b166	xorpd	%xmm0, %xmm0
000000000007b16a	movq	%rbx, %rdi
000000000007b16d	movq	%r15, %rsi
000000000007b170	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000007b175	movapd	%xmm0, -0x90(%rbp)
000000000007b17d	xorpd	%xmm0, %xmm0
000000000007b181	movq	%r14, %rdi
000000000007b184	movq	%r15, %rsi
000000000007b187	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000007b18c	movsd	%xmm0, -0x58(%rbp)
000000000007b191	xorpd	%xmm0, %xmm0
000000000007b195	movq	%r12, %rdi
000000000007b198	movq	%r15, %rsi
000000000007b19b	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000007b1a0	movapd	-0x90(%rbp), %xmm6
000000000007b1a8	movsd	-0x58(%rbp), %xmm5
000000000007b1ad	movapd	%xmm0, %xmm1
000000000007b1b1	subsd	-0x70(%rbp), %xmm6
000000000007b1b6	subsd	-0x68(%rbp), %xmm5
000000000007b1bb	subsd	-0x60(%rbp), %xmm1
000000000007b1c0	movapd	%xmm6, %xmm0
000000000007b1c4	mulsd	%xmm6, %xmm0
000000000007b1c8	movapd	%xmm5, %xmm2
000000000007b1cc	mulsd	%xmm5, %xmm2
000000000007b1d0	addsd	%xmm0, %xmm2
000000000007b1d4	movapd	%xmm1, %xmm0
000000000007b1d8	mulsd	%xmm1, %xmm0
000000000007b1dc	addsd	%xmm2, %xmm0
000000000007b1e0	sqrtsd	%xmm0, %xmm3
000000000007b1e4	movapd	0x351a4(%rip), %xmm0
000000000007b1ec	andpd	%xmm3, %xmm0
000000000007b1f0	movsd	0x351b8(%rip), %xmm4
000000000007b1f8	ucomisd	%xmm0, %xmm4
000000000007b1fc	ja	0x7b206
000000000007b1fe	divsd	%xmm3, %xmm5
000000000007b202	divsd	%xmm3, %xmm1
000000000007b206	movq	-0x30(%rbp), %rdx
000000000007b20a	movapd	%xmm6, %xmm2
000000000007b20e	divsd	%xmm3, %xmm2
000000000007b212	cmpltsd	%xmm4, %xmm0
000000000007b217	blendvpd	%xmm0, %xmm6, %xmm2
000000000007b21c	xorpd	%xmm3, %xmm3
000000000007b220	mulsd	%xmm3, %xmm5
000000000007b224	testq	%rdx, %rdx
000000000007b227	movq	-0x80(%rbp), %rax
000000000007b22b	movq	-0x78(%rbp), %rcx
000000000007b22f	leaq	0xc8(%rsp), %rsp
000000000007b237	popq	%rbx
000000000007b238	popq	%r12
000000000007b23a	popq	%r13
000000000007b23c	popq	%r14
000000000007b23e	popq	%r15
000000000007b240	popq	%rbp
000000000007b241	je	0x7b24f
000000000007b243	movapd	%xmm5, %xmm0
000000000007b247	subsd	%xmm1, %xmm0
000000000007b24b	movsd	%xmm0, (%rdx)
000000000007b24f	testq	%rcx, %rcx
000000000007b252	je	0x7b264
000000000007b254	mulsd	%xmm3, %xmm1
000000000007b258	mulsd	%xmm2, %xmm3
000000000007b25c	subsd	%xmm3, %xmm1
000000000007b260	movsd	%xmm1, (%rcx)
000000000007b264	testq	%rax, %rax
000000000007b267	je	0x7b271
000000000007b269	subsd	%xmm5, %xmm2
000000000007b26d	movsd	%xmm2, (%rax)
000000000007b271	retq
