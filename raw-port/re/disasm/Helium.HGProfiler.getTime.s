__ZN10HGProfiler7getTimeEv:
00000000001c3dd0	pushq	%rbp
00000000001c3dd1	movq	%rsp, %rbp
00000000001c3dd4	movq	0x8(%rdi), %rax
00000000001c3dd8	testq	%rax, %rax
00000000001c3ddb	js	0x1c3df0
00000000001c3ddd	cvtsi2ss	%rax, %xmm0
00000000001c3de2	mulss	__ZN10HGProfiler7_tbfreqE(%rip), %xmm0 ## HGProfiler::_tbfreq
00000000001c3dea	cvtss2sd	%xmm0, %xmm0
00000000001c3dee	popq	%rbp
00000000001c3def	retq
00000000001c3df0	movq	%rax, %rcx
00000000001c3df3	shrq	%rcx
00000000001c3df6	andl	$0x1, %eax
00000000001c3df9	orq	%rcx, %rax
00000000001c3dfc	cvtsi2ss	%rax, %xmm0
00000000001c3e01	addss	%xmm0, %xmm0
00000000001c3e05	mulss	__ZN10HGProfiler7_tbfreqE(%rip), %xmm0 ## HGProfiler::_tbfreq
00000000001c3e0d	cvtss2sd	%xmm0, %xmm0
00000000001c3e11	popq	%rbp
00000000001c3e12	retq
00000000001c3e13	nopw	%cs:(%rax,%rax)
