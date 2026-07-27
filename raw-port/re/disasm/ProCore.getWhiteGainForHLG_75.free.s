__ZL21getWhiteGainForHLG_75v:
0000000000004550	movb	__ZGVZL21getWhiteGainForHLG_75vE6result(%rip), %al ## guard variable for getWhiteGainForHLG_75()::result
0000000000004556	testb	%al, %al
0000000000004558	je	0x4563
000000000000455a	movss	__ZZL21getWhiteGainForHLG_75vE6result(%rip), %xmm0 ## getWhiteGainForHLG_75()::result
0000000000004562	retq
0000000000004563	pushq	%rbp
0000000000004564	movq	%rsp, %rbp
0000000000004567	callq	__ZL21getWhiteGainForHLG_75v.cold.1 ## getWhiteGainForHLG_75() (.cold.1)
000000000000456c	popq	%rbp
000000000000456d	jmp	0x455a
