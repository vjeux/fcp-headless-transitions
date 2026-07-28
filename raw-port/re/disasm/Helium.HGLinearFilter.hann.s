__ZN14HGLinearFilter4hannEfff:
000000000010f670	movaps	0x2b85b9(%rip), %xmm2
000000000010f677	andps	%xmm0, %xmm2
000000000010f67a	xorps	%xmm3, %xmm3
000000000010f67d	movss	0x2b863b(%rip), %xmm4
000000000010f685	ucomiss	%xmm2, %xmm4
000000000010f688	jbe	0x10f6bf
000000000010f68a	pushq	%rbp
000000000010f68b	movq	%rsp, %rbp
000000000010f68e	subq	$0x10, %rsp
000000000010f692	subss	%xmm1, %xmm4
000000000010f696	movss	%xmm4, -0x4(%rbp)
000000000010f69b	mulss	0x2c2ce5(%rip), %xmm0
000000000010f6a3	movss	%xmm1, -0x8(%rbp)
000000000010f6a8	callq	0x3c5078                        ## symbol stub for: _cosf
000000000010f6ad	movaps	%xmm0, %xmm3
000000000010f6b0	mulss	-0x4(%rbp), %xmm3
000000000010f6b5	addss	-0x8(%rbp), %xmm3
000000000010f6ba	addq	$0x10, %rsp
000000000010f6be	popq	%rbp
000000000010f6bf	movaps	%xmm3, %xmm0
000000000010f6c2	retq
000000000010f6c3	nopw	%cs:(%rax,%rax)
