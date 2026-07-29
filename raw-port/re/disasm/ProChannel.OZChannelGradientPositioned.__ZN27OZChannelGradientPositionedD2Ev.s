__ZN27OZChannelGradientPositionedD2Ev:
000000000006d758	pushq	%rbp
000000000006d759	movq	%rsp, %rbp
000000000006d75c	pushq	%rbx
000000000006d75d	pushq	%rax
000000000006d75e	movq	%rdi, %rbx
000000000006d761	leaq	0x6dbe8(%rip), %rax
000000000006d768	movq	%rax, (%rdi)
000000000006d76b	leaq	0x6deb6(%rip), %rax
000000000006d772	movq	%rax, 0x10(%rdi)
000000000006d776	addq	$0x6e0, %rdi                    ## imm = 0x6E0
000000000006d77d	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d782	leaq	0x420(%rbx), %rdi
000000000006d789	callq	__ZN17OZChannelPositionD1Ev     ## OZChannelPosition::~OZChannelPosition()
000000000006d78e	movq	%rbx, %rdi
000000000006d791	addq	$0x8, %rsp
000000000006d795	popq	%rbx
000000000006d796	popq	%rbp
000000000006d797	jmp	__ZN23OZChannelGradientExtrasD2Ev ## OZChannelGradientExtras::~OZChannelGradientExtras()
