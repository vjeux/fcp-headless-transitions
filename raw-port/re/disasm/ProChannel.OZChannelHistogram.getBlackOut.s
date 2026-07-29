
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000070444 <__ZN18OZChannelHistogram11getBlackOutEi>:
   70444: 55                           	pushq	%rbp
   70445: 48 89 e5                     	movq	%rsp, %rbp
   70448: 83 fe 04                     	cmpl	$0x4, %esi
   7044b: 77 3d                        	ja	0x7048a <__ZN18OZChannelHistogram11getBlackOutEi+0x46>
   7044d: 48 89 f8                     	movq	%rdi, %rax
   70450: 89 f1                        	movl	%esi, %ecx
   70452: 48 8d 15 37 00 00 00         	leaq	0x37(%rip), %rdx        ## 0x70490 <__ZN18OZChannelHistogram11getBlackOutEi+0x4c>
   70459: 48 63 0c 8a                  	movslq	(%rdx,%rcx,4), %rcx
   7045d: 48 01 d1                     	addq	%rdx, %rcx
   70460: ff e1                        	jmpq	*%rcx
   70462: 48 05 a8 02 00 00            	addq	$0x2a8, %rax            ## imm = 0x2A8
   70468: eb 22                        	jmp	0x7048c <__ZN18OZChannelHistogram11getBlackOutEi+0x48>
   7046a: 48 05 a8 10 00 00            	addq	$0x10a8, %rax           ## imm = 0x10A8
   70470: eb 1a                        	jmp	0x7048c <__ZN18OZChannelHistogram11getBlackOutEi+0x48>
   70472: 48 05 a8 09 00 00            	addq	$0x9a8, %rax            ## imm = 0x9A8
   70478: eb 12                        	jmp	0x7048c <__ZN18OZChannelHistogram11getBlackOutEi+0x48>
   7047a: 48 05 28 0d 00 00            	addq	$0xd28, %rax            ## imm = 0xD28
   70480: eb 0a                        	jmp	0x7048c <__ZN18OZChannelHistogram11getBlackOutEi+0x48>
   70482: 48 05 28 06 00 00            	addq	$0x628, %rax            ## imm = 0x628
   70488: eb 02                        	jmp	0x7048c <__ZN18OZChannelHistogram11getBlackOutEi+0x48>
   7048a: 31 c0                        	xorl	%eax, %eax
   7048c: 5d                           	popq	%rbp
   7048d: c3                           	retq
   7048e: 66 90                        	nop
   70490: d2 ff                        	sarb	%cl, %bh
   70492: ff ff                        	<unknown>
   70494: f2 ff ff                     	<unknown>
   70497: ff e2                        	jmpq	*%rdx
   70499: ff ff                        	<unknown>
   7049b: ff ea                        	<unknown>
   7049d: ff ff                        	<unknown>
   7049f: ff da                        	<unknown>
   704a1: ff ff                        	<unknown>
   704a3: ff 55 48                     	callq	*0x48(%rbp)
