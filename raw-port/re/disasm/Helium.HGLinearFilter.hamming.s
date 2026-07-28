__ZN14HGLinearFilter7hammingEfff:
000000000010f6d0	movaps	0x2b8559(%rip), %xmm2
000000000010f6d7	andps	%xmm0, %xmm2
000000000010f6da	xorps	%xmm1, %xmm1
000000000010f6dd	movss	0x2b85db(%rip), %xmm3
000000000010f6e5	ucomiss	%xmm2, %xmm3
000000000010f6e8	jbe	0x10f70f
000000000010f6ea	pushq	%rbp
000000000010f6eb	movq	%rsp, %rbp
000000000010f6ee	mulss	0x2c2c92(%rip), %xmm0
000000000010f6f6	callq	0x3c5078                        ## symbol stub for: _cosf
000000000010f6fb	movaps	%xmm0, %xmm1
000000000010f6fe	mulss	0x2c2ce6(%rip), %xmm1
000000000010f706	addss	0x2c2ce2(%rip), %xmm1
000000000010f70e	popq	%rbp
000000000010f70f	movaps	%xmm1, %xmm0
000000000010f712	retq
000000000010f713	nopw	%cs:(%rax,%rax)
