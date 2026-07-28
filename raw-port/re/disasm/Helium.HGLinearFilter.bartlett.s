__ZN14HGLinearFilter8bartlettEfff:
000000000010f0e0	pushq	%rbp
000000000010f0e1	movq	%rsp, %rbp
000000000010f0e4	andps	0x2b8b45(%rip), %xmm0
000000000010f0eb	movss	0x2b8bcd(%rip), %xmm1
000000000010f0f3	movaps	%xmm1, %xmm2
000000000010f0f6	subss	%xmm0, %xmm2
000000000010f0fa	cmpltss	%xmm1, %xmm0
000000000010f0ff	andps	%xmm2, %xmm0
000000000010f102	popq	%rbp
000000000010f103	retq
000000000010f104	nopw	%cs:(%rax,%rax)
