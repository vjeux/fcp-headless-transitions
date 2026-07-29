__ZNK16OZChannelScale3D8getValueERK6CMTimePdS3_S3_d:
000000000009ed50	pushq	%rbp
000000000009ed51	movq	%rsp, %rbp
000000000009ed54	pushq	%r15
000000000009ed56	pushq	%r14
000000000009ed58	pushq	%r13
000000000009ed5a	pushq	%r12
000000000009ed5c	pushq	%rbx
000000000009ed5d	pushq	%rax
000000000009ed5e	movq	%r8, %rbx
000000000009ed61	movq	%rcx, %r12
000000000009ed64	movq	%rsi, %r14
000000000009ed67	movq	%rdi, %r15
000000000009ed6a	testq	%rdx, %rdx
000000000009ed6d	movsd	%xmm0, -0x30(%rbp)
000000000009ed72	je	0x9ed96
000000000009ed74	movq	%rdx, %r13
000000000009ed77	leaq	0x88(%r15), %rdi
000000000009ed7e	movq	%r14, %rsi
000000000009ed81	movsd	-0x30(%rbp), %xmm0
000000000009ed86	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000009ed8b	movsd	%xmm0, (%r13)
000000000009ed91	movsd	-0x30(%rbp), %xmm0
000000000009ed96	testq	%r12, %r12
000000000009ed99	je	0x9edba
000000000009ed9b	leaq	0x120(%r15), %rdi
000000000009eda2	movq	%r14, %rsi
000000000009eda5	movsd	-0x30(%rbp), %xmm0
000000000009edaa	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000009edaf	movsd	%xmm0, (%r12)
000000000009edb5	movsd	-0x30(%rbp), %xmm0
000000000009edba	testq	%rbx, %rbx
000000000009edbd	je	0x9edd5
000000000009edbf	addq	$0x1b8, %r15                    ## imm = 0x1B8
000000000009edc6	movq	%r15, %rdi
000000000009edc9	movq	%r14, %rsi
000000000009edcc	callq	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
000000000009edd1	movsd	%xmm0, (%rbx)
000000000009edd5	addq	$0x8, %rsp
000000000009edd9	popq	%rbx
000000000009edda	popq	%r12
000000000009eddc	popq	%r13
000000000009edde	popq	%r14
000000000009ede0	popq	%r15
000000000009ede2	popq	%rbp
000000000009ede3	retq
