__ZN23HGRasterizerTextureUnitaSERS_:
00000000001a0100	pushq	%rbp
00000000001a0101	movq	%rsp, %rbp
00000000001a0104	pushq	%r14
00000000001a0106	pushq	%rbx
00000000001a0107	movq	%rsi, %r14
00000000001a010a	movq	%rdi, %rbx
00000000001a010d	movq	(%rdi), %rdi
00000000001a0110	movq	(%rdi), %rax
00000000001a0113	callq	*0x18(%rax)
00000000001a0116	movq	(%r14), %rdi
00000000001a0119	movq	%rdi, (%rbx)
00000000001a011c	movq	(%rdi), %rax
00000000001a011f	callq	*0x10(%rax)
00000000001a0122	movups	0xa0(%r14), %xmm0
00000000001a012a	movups	%xmm0, 0xa0(%rbx)
00000000001a0131	movups	0xb0(%r14), %xmm0
00000000001a0139	movups	%xmm0, 0xb0(%rbx)
00000000001a0140	movzbl	0xc0(%r14), %eax
00000000001a0148	movb	%al, 0xc0(%rbx)
00000000001a014e	movzbl	0xc1(%r14), %eax
00000000001a0156	movb	%al, 0xc1(%rbx)
00000000001a015c	movzbl	0xc2(%r14), %eax
00000000001a0164	movb	%al, 0xc2(%rbx)
00000000001a016a	movss	0xc4(%r14), %xmm0
00000000001a0173	movss	%xmm0, 0xc4(%rbx)
00000000001a017b	movss	0xc8(%r14), %xmm0
00000000001a0184	movss	%xmm0, 0xc8(%rbx)
00000000001a018c	movss	0xcc(%r14), %xmm0
00000000001a0195	movss	%xmm0, 0xcc(%rbx)
00000000001a019d	movss	0xd0(%r14), %xmm0
00000000001a01a6	movss	%xmm0, 0xd0(%rbx)
00000000001a01ae	popq	%rbx
00000000001a01af	popq	%r14
00000000001a01b1	popq	%rbp
00000000001a01b2	retq
00000000001a01b3	nopw	%cs:(%rax,%rax)
