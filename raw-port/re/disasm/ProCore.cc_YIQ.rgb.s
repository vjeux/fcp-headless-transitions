__ZNK6cc_YIQ3rgbEv:
000000000009733a	pushq	%rbp
000000000009733b	movq	%rsp, %rbp
000000000009733e	pushq	%rbx
000000000009733f	subq	$0x18, %rsp
0000000000097343	movq	%rdi, %rsi
0000000000097346	leaq	__ZN2cc6matrix7YIQ2rgbE(%rip), %rdx ## cc::matrix::YIQ2rgb
000000000009734d	leaq	-0x18(%rbp), %rbx
0000000000097351	movq	%rbx, %rdi
0000000000097354	callq	__ZNK6cc_YIQmlERK9cc_matrix     ## cc_YIQ::operator*(cc_matrix const&) const
0000000000097359	movsd	(%rbx), %xmm0
000000000009735d	movss	0x8(%rbx), %xmm1
0000000000097362	addq	$0x18, %rsp
0000000000097366	popq	%rbx
0000000000097367	popq	%rbp
0000000000097368	retq
0000000000097369	nop
