__ZN14HGLinearFilter4discEffff:
000000000010f790	pushq	%rbp
000000000010f791	movq	%rsp, %rbp
000000000010f794	mulss	%xmm0, %xmm0
000000000010f798	mulss	%xmm1, %xmm1
000000000010f79c	addss	%xmm1, %xmm0
000000000010f7a0	movss	0x2b8518(%rip), %xmm1
000000000010f7a8	cmpltss	%xmm1, %xmm0
000000000010f7ad	andps	%xmm1, %xmm0
000000000010f7b0	popq	%rbp
000000000010f7b1	retq
000000000010f7b2	addb	%al, (%rax)
000000000010f7b4	addb	%al, (%rax)
000000000010f7b6	addb	%al, (%rax)
000000000010f7b8	addb	%al, (%rax)
000000000010f7ba	addb	%al, (%rax)
000000000010f7bc	addb	%al, (%rax)
000000000010f7be	addb	%al, (%rax)
